import * as React from 'react';

import NewReadingScreen from './NewReadingScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './menu/EditResourceScreen';
import SearchScreenWithContext from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import { ConfigFactory } from '../config/ConfigFactory';
import App from '../App';
import TestApp from '../TestApp';

import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist'
import OWApp, { initialState } from '../reducers';
import { Provider } from 'react-redux';
import * as appActions from '../actions/index';
import thunkMiddleware from 'redux-thunk';
//@ts-ignore
import { createLogger } from 'redux-logger';
import { UserType, MobileUser } from '../typings/UserTypes';
import { OWUser } from '../typings/models/OurWater';
import { ResultType, makeError, makeSuccess } from '../typings/AppProviderTypes';
import SyncScreen from './menu/SyncScreen';
import { EnableLogging, EnableReduxLogging, EnableCaching } from '../utils/EnvConfig';
import SelectLanguageModal from './menu/SelectLanguageModal';
import ScanScreen from './ScanScreen';
import SimpleMapScreen from './SimpleMapScreen';
import SimpleResourceScreen from './SimpleResourceScreen';
import SimpleResourceDetailScreen from './SimpleResourceDetailScreen';
import TakePictureScreen from './TakePictureScreen';
import GroundwaterSyncScreen from './GroundwaterSyncScreen';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import SignInScreen from './menu/SignInScreen';
import { RNFirebase } from 'react-native-firebase';
import { AnonymousUser } from '../typings/api/FirebaseApi';
import EditReadingsScreen from './EditReadingsScreen';
// @ts-ignore
import * as AsyncStorage from 'rn-async-storage';
import { AnyAction } from '../actions/AnyAction';
import { ActionType } from '../actions/ActionType';
import { maybeLog } from '../utils';
import PendingScreen from './menu/PendingScreen';
import { ExternalServiceApiType } from '../api/ExternalServiceApi';
import { Navigation } from 'react-native-navigation';
import { NavigationName } from '../typings/enums';


let loggerMiddleware: any = null;
if (EnableReduxLogging) {
  console.log("REDUX LOGGING ENABLED")
  loggerMiddleware = createLogger();
} else {
  console.log("REDUX LOGGING DISABLED");
}


//TODO: figure out if user has changed and remove old subscriptions
const setUpUserSubscriptions = (store: any, config: ConfigFactory, userId: string) => {
  /* Subscribe to firebase updates */
  const unsubscribe = config.userApi.subscribeToUser(userId, (user: OWUser) => {
    store.dispatch(appActions.getUserResponse({ type: ResultType.SUCCESS, result: user }))
  });
  store.dispatch(appActions.passOnUserSubscription(unsubscribe));

  config.appApi.subscribeToPendingReadings(userId, (readings: PendingReading[]) => {
    store.dispatch(appActions.getBulkPendingReadings({ type: ResultType.SUCCESS, result: readings }))
  });

  config.appApi.subscribeToPendingResources(userId, (resources: PendingResource[]) => {
    store.dispatch(appActions.getPendingResourcesResponse({ type: ResultType.SUCCESS, result: resources }))
  });
}

export async function getCached(id: string): Promise<any | null> {
  if (!EnableCaching) {
    maybeLog("Tried getCached but EnableCaching is false.");
    return null;
  }

  try {
    const json = await AsyncStorage.getItem(id);
    if (!json) {
      return null;
    }

    const parsed = JSON.parse(json);
    return parsed;
  } catch(err) {
    maybeLog("getCached, " + err.message);
    return null;
  }
}

export async function registerScreens(config: ConfigFactory) {
  const persistMiddleware = () => {
    return (next: any) => (action: AnyAction) => {
      const returnValue = next(action);
      
      if (action.type === ActionType.GET_RESOURCES_RESPONSE) {
        if (action.result.type === ResultType.SUCCESS) {
          const state = store.getState();
          AsyncStorage.setItem('ourwater_resources', JSON.stringify(state.resources));
          AsyncStorage.setItem('ourwater_resourcesCache', JSON.stringify(state.resourcesCache));
        }
      }

      if (action.type === ActionType.GET_SHORT_ID_RESPONSE) {
        if (action.result.type === ResultType.SUCCESS) {
          const state = store.getState();
          AsyncStorage.setItem('ourwater_shortIdCache', JSON.stringify(state.shortIdCache))
          AsyncStorage.setItem('ourwater_shortIdMeta', JSON.stringify(state.shortIdMeta))
        }
      }

      return returnValue;
    }
  }

  let resources = await getCached('ourwater_resources');
  let resourcesCache = await getCached('ourwater_resourcesCache');
  let shortIdCache = await getCached('ourwater_shortIdCache');
  let shortIdMeta = await getCached('ourwater_shortIdMeta');

  let middleware;
  if (loggerMiddleware) {
    middleware = applyMiddleware(persistMiddleware, thunkMiddleware, loggerMiddleware);
  } else {
    middleware = applyMiddleware(persistMiddleware, thunkMiddleware);
  }

  if (resources) {
    initialState.resources = resources;
  }

  if (resourcesCache) {
    initialState.resourcesCache = resourcesCache;
  }

  if (shortIdCache) {
    initialState.shortIdCache = shortIdCache;
  }

  if (shortIdMeta) {
    initialState.shortIdMeta = shortIdMeta;
  }

  const store = createStore(
    OWApp, 
    initialState,
    compose(
      middleware,
    ),
  );

  //Update the translations to use the remote config
  store.dispatch(appActions.updatedTranslation(config.getTranslationFiles(), config.getTranslationOptions()));


  //Listen for a user
  const authUnsubscribe = config.userApi.onAuthStateChanged(async (rnFirebaseUser: null | RNFirebase.User) => {
    if (!rnFirebaseUser) {
      await store.dispatch(appActions.silentLogin(config.appApi));
      return;
    }
    
    //Get the token
    let token;
    try {
      token = await rnFirebaseUser.getIdToken();
    } catch (err) {
      store.dispatch(appActions.loginCallback(makeError<MobileUser | AnonymousUser>('Could not get token for user')))
      return;
    }


    //Build the user
    let user: AnonymousUser | MobileUser;
    if (rnFirebaseUser.isAnonymous) {
      user = {
        type: UserType.USER,
        userId: rnFirebaseUser.uid,
        token,
      }
    } else {
      user = {
        type: UserType.MOBILE_USER,
        userId: rnFirebaseUser.uid,
        token,
        mobile: rnFirebaseUser.phoneNumber,
      }
    }

    setUpUserSubscriptions(store, config, user.userId);
    store.dispatch(appActions.loginCallback(makeSuccess<AnonymousUser | MobileUser>(user)))
  });

  // @ts-ignore
  const locationResult = await store.dispatch(appActions.getGeolocation());

  if (config.externalServiceApi.externalServiceApiType === ExternalServiceApiType.Has) {
    await store.dispatch(appActions.getExternalLoginDetails(config.externalServiceApi));
  }

  console.log("registering navigation components");
  Navigation.registerComponentWithRedux(NavigationName.App, () => App, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.MenuScreen, () => SettingsScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SearchScreen, () => SearchScreenWithContext, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.EditResourceScreen, () => EditResourceScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.ConnectToServiceScreen, () => ConnectToServiceScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SyncScreen, () => SyncScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SignInScreen, () => SignInScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.NewReadingScreen, () => NewReadingScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SelectLanguageModal, () => SelectLanguageModal, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.ScanScreen, () => ScanScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SimpleMapScreen, () => SimpleMapScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SimpleResourceScreen, () => SimpleResourceScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.SimpleResourceDetailScreen, () => SimpleResourceDetailScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.TakePictureScreen, () => TakePictureScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.GroundwaterSyncScreen, () => GroundwaterSyncScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.EditReadingsScreen, () => EditReadingsScreen, Provider, store);
  Navigation.registerComponentWithRedux(NavigationName.PendingScreen, () => PendingScreen, Provider, store);

  return store;
}