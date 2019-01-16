/**
 * Main OurWater App
 * 
 */
import * as React from 'react'; import { Component } from 'react';
console.ignoredYellowBox = ['Remote debugger'];
import {
  BackHandler,
  ScrollView,
  Text,
  View,
  ProgressBarAndroid,
  ToastAndroid,
  TabBarIOSItem,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Loading from './components/common/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import { Location, LocationType } from './typings/Location';
import { 
  navigateTo,
  showModal,
  maybeLog,
} from './utils';
import {
  MapStateOption,
  MapHeightOption,
  HomeScreenType,
} from './enums';
import { bgLight, primaryDark, primary, primaryLight } from './utils/Colors';
import FavouriteResourceList from './components/FavouriteResourceList';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { Resource, BasicCoords } from './typings/models/OurWater';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from './components/MapSection';
import PendingChangesBanner from './components/PendingChangesBanner';
import { SyncStatus, NavigationId } from './typings/enums';

import { connect } from 'react-redux'
import NetworkStatusBanner from './components/NetworkStatusBanner';
import { AppState } from './reducers';
import * as appActions from './actions/index';
import { UserType } from './typings/UserTypes';
import { ActionMeta, SyncMeta } from './typings/Reducer';
import { ResultType, SomeResult } from './typings/AppProviderTypes';
import ExternalServiceApi, { MaybeExternalServiceApi } from './api/ExternalServiceApi';
import { GGMNSearchEntity } from './typings/models/GGMN';
import { TranslationFile } from 'ow_translations';
import { SearchButtonPressedEvent } from './utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import HomeMapScreen from './screens/HomeMapScreen';
import HomeSimpleScreen from './screens/HomeSimpleScreen';

import SplashScreen from 'react-native-splash-screen';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
  componentId: NavigationId,
}

export interface StateProps {  
  translation: TranslationFile,
}

export interface ActionProps {

}

export interface State {
}

class App extends Component<OwnProps & StateProps & ActionProps> {
  state: State = {};
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    //Hide the react-native-splashscreen
    //ref: https://medium.com/handlebar-labs/how-to-add-a-splash-screen-to-a-react-native-app-ios-and-android-30a3cec835ae
    // SplashScreen.hide()
    
    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();
  }
  
  render() {
    //TODO: check the settings

    switch(this.props.config.getHomeScreenType()) {
      case (HomeScreenType.Map): {
        return (
          <HomeMapScreen
            navigator={this.props.navigator}
            config={this.props.config}
            appApi={this.props.appApi}
          />
        )
      }
      case (HomeScreenType.Simple): {
        return (
          <HomeSimpleScreen
            appApi={this.props.appApi}
            componentId={this.props.componentId}
            config={this.props.config}
          />
        );
      }
    }
  }
}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);