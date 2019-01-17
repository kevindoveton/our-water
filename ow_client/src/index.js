
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { primaryDark, secondaryLight, secondaryDark, primaryLight, secondaryText, bgMed } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory, EnvConfig } from './config/ConfigFactory';
import { FirebaseConfig } from './config/FirebaseConfig';
import Config from 'react-native-config';
import GGMNDevConfig from './config/GGMNDevConfig';
import MyWellDevConfig from './config/MyWellDevConfig';
import NetworkApi from './api/NetworkApi';
import * as EnvironmentConfig from './utils/EnvConfig';
import SearchButton from './components/common/SearchButton';
import { SearchButtonPressedEvent, SearchEventValue } from './utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import TestApp from './TestApp';
import { HomeScreenType } from './enums';
import { primaryText } from './utils/NewColors';
import { NavigationId, NavigationName } from './typings/enums';

const homeIcon = require('./assets/home.png');
const scanIcon = require('./assets/scan.png');
const mapIcon = require('./assets/map.png');

// This fixes Set issues with react native
// ref: https://github.com/facebook/react-native/issues/3223
require('core-js/es6/array')

let config: ConfigFactory;
const orgId = EnvironmentConfig.OrgId;

//TODO: refactor and clean this all up
function bootstrap () {
  Promise.resolve(true)
  .then(() => {
    if (Config.SHOULD_USE_LOCAL_CONFIG === 'true') {
      console.log("USING LOCAL CONFIG");
      switch (Config.CONFIG_TYPE) {
        case 'GGMNDevConfig':
          return GGMNDevConfig;
        default:
          return MyWellDevConfig;
      }
    }
    return FirebaseConfig.getAllConfig();
  })
  .catch(err => {
    console.log("Error getting remote config", err);
    console.log("Defaulting to local config.");
    
    switch (Config.CONFIG_TYPE) {
      case 'GGMNDevConfig':
        return GGMNDevConfig;
      default:
        return MyWellDevConfig;
    }
  })
  .then(async (_remoteConfig) => {
    const networkApi = await NetworkApi.createAndInit();
    const envConfig: EnvConfig = {
      orgId,
    }

    config = new ConfigFactory(_remoteConfig, envConfig, networkApi);
    return registerScreens(config);
  })
  .then(() => {
    console.log("registering AppRegistry");
    // For debugging Navigation issues
    Navigation.registerComponent('TestApp', () => TestApp);

    Navigation.setDefaultOptions({
      layout: {
        backgroundColor: 'white',
        orientation: ['portrait'],
      },
      modalPresentationStyle: 'none',
      bottomTabs: {
        // elevation: 8, // BottomTabs elevation in dp
        titleDisplayMode: 'alwaysHide'
      },
      push: {
        content: {
          x: {
            from: -1000,
            to: 0,
            duration: 300,
          },
          alpha: { // Optional
            from: 0.5,
            to: 1,
            duration: 300,
          }
        }
      },
    });

    // console.log("registering search button");
    // Navigation.registerComponent('example.SearchButton', () => SearchButton);

    const navigatorButtons = {
      leftButtons: [{
        title: 'MENU',
        passProps: {},
        id: 'sideMenu',
        disabled: false,
        disableIconTint: true,
        buttonColor: primaryText.high,
        buttonFontSize: 14,
        buttonFontWeight: '600'
      }],
      rightButtons: [{
        component: 'example.SearchButton',
        passProps: {
          text: 'Search',
        },
        id: 'search',
      }],
    };

    const drawer = {
      left: {
        screen: 'screen.MenuScreen',
        disableOpenGesture: true,
        fixedWidth: 800,
        passProps: {
          config
        }
      }
    };

    switch(config.getHomeScreenType()) {
      case (HomeScreenType.Map): {
        Navigation.startSingleScreenApp({
          screen: {
            screen: 'screen.App',
            title: config.getApplicationName(),
            navigatorStyle: defaultNavigatorStyle,
            navigatorButtons,
          },
          drawer,
          animationType: 'fade',
          passProps: {
            config,
          },
        });

        break;
      }
      case (HomeScreenType.Simple): {
        const leftMenu = {
          component: { 
            id: NavigationId.leftSideComponentId,
            name: NavigationName.MenuScreen,
            passProps: { config },
          }
        };

        const homeTab = {
          stack: {
            id: 'homeTabStack',
            children: [{
              component: {
                id: NavigationId.tabHome,
                name: NavigationName.App,
                passProps: { config, componentId: NavigationId.tabHome },
              }
            }],
            options: {
              bottomTab: {
                icon: homeIcon,
                testID: 'FIRST_TAB_BAR_BUTTON'
              }
            }
          }
        };

        const scanTab = {
          component: {
            id: NavigationId.tabScan,
            name: NavigationName.ScanScreen,
            passProps: { config, componentId: NavigationId.tabScan },
            options: {
              bottomTab: {
                icon: scanIcon,
                testID: 'SECOND_TAB_BAR_BUTTON'
              }
            }
          }
        };

        const mapTab = {
          component: {
            id: NavigationId.tabMap,
            name: NavigationName.SimpleMapScreen,
            passProps: { config },
            options: {
              bottomTab: {
                icon: mapIcon,
                  testID: 'THIRD_TAB_BAR_BUTTON'
              }
            }
          }
        };

        // Navigation.setRoot({
        //   root: {
        //     sideMenu: {
        //       left: leftMenu,
        //       center: {
        //         bottomTabs: {
        //           children: [
        //             homeTab,
        //             scanTab,
        //             mapTab,
        //           ]
        //         }
        //       }
        //     }
        //   }
        // });
        Navigation.setRoot({
          root: {
            stack: {
              id: 'homeTabStack',
              children: [{
                component: {
                  id: NavigationId.tabHome,
                  name: 'TestApp',
                  passProps: { config, componentId: NavigationId.tabHome },
                }
              }],
              options: {
                bottomTab: {
                  icon: homeIcon,
                  testID: 'FIRST_TAB_BAR_BUTTON'
                }
              }
            }
          }
        });

      

        // Navigation.setRoot({
        //   root: {
        //     bottomTabs: {
        //       children: [{
        //         component: {
        //           name: 'screen.TestApp',
        //           passProps: { config },
        //           options: {
        //             bottomTab: {
        //               text: 'Tab 2',
        //               icon: scanIcon,
        //               testID: 'SECOND_TAB_BAR_BUTTON'
        //             }
        //           }
        //         }
        //       }]
        //     }
        //   }
        // });

        // Navigation.startTabBasedApp({
        //   tabs: [
        //     {
        //       screen: 'screen.App',
        //       icon: homeIcon,
        //       title: config.getApplicationName(),
        //       navigatorButtons,
        //       navigatorStyle: defaultNavigatorStyle,
        //     },
        //     {
        //       screen: 'screen.ScanScreen',
        //       icon: scanIcon,
        //       title: config.getApplicationName(),
        //       navigatorButtons,
        //       navigatorStyle: defaultNavigatorStyle,
        //     },
        //     {
        //       screen: 'screen.SimpleMapScreen',
        //       icon: mapIcon,
        //       title: config.getApplicationName(),
        //       navigatorButtons,
        //       navigatorStyle: defaultNavigatorStyle,
        //     }
        //   ],
        //   tabsStyle: { 
        //     tabBarButtonColor: primaryText,
        //     tabBarSelectedButtonColor: primaryDark,
        //     tabBarBackgroundColor: '#551A8B', // optional, change the background color of the tab bar
        //     initialTabIndex: 1, // optional, the default selected bottom tab. Default: 0. On Android, add this to appStyle
        //   },
        //   appStyle: {
        //     // Here for android
        //     tabBarButtonColor: bgMed,
        //     tabBarSelectedButtonColor: primaryDark,
        //     orientation: 'portrait',
        //     bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
        //     bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
        //   },
        //   drawer,
        //   passProps: {config},
        //   animationType: 'fade'
        // });
      break;
      }
      default: 
        throw new Error(`Unknown home screen type: ${config.getHomeScreenType()}`);
    }
  })
  .catch((err: Error) => console.error(err));
}


Navigation.events().registerAppLaunchedListener(() => {
  console.log("app launched ?");
  bootstrap();

  // Navigation.setRoot({
  //   name: 'App',
  //   options: {},
  //   passProps: {},
  // });

});