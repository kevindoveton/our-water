import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
import { ResourceType } from '../enums';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { withTabWrapper } from '../components/TabWrapper';
import { compose } from 'redux';
import { TranslationFile } from 'ow_translations';
import MenuButton from '../components/common/MenuButton';
import { menuColors } from '../utils/NewColors';
import { NavigationName, NavigationId } from '../typings/enums';


export interface OwnProps {
  appApi: BaseApi,
  componentId: NavigationId,
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  menu_well: string,
  menu_rainfall: string,
  menu_water_quality: string,
  menu_checkdam: string,
}

export interface ActionProps {

}


class HomeSimpleScreen extends Component<OwnProps & StateProps & ActionProps> {

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

  }

  /**
   * A list of the reading options: Groundwater, Rainfall, Checkdam and Water Quality
   * 
   * //TODO: Load only the icons based on user's settings 
   */
  getMenuButtons() {
    const { menu_well, menu_rainfall, menu_water_quality, menu_checkdam } = this.props;
    
    const presentResourceScreen = (pluralResourceName: string, resourceType: ResourceType): void => {
      navigateTo(this.props.componentId, NavigationName.SimpleResourceScreen, {
      // navigateTo('homeTabStack', NavigationName.SimpleResourceScreen, {
        config: this.props.config,
        userId: this.props.userId,
        resourceType
      }, {
        topBar: {
          title: {
            text: 'Post1'
          }
        }
      });
    }

    return (
      <View style={{
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          <MenuButton 
            color={menuColors[0]}
            name={menu_well}
            onPress={() => presentResourceScreen('Wells', ResourceType.well)}
          />
          <MenuButton 
            color={menuColors[1]}
            name={menu_rainfall}
            onPress={() => presentResourceScreen('Raingauges', ResourceType.raingauge)}
          />
        </View>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          <MenuButton
            color={menuColors[2]}
            name={menu_water_quality}
            onPress={() => presentResourceScreen('Water Quality', ResourceType.quality)}
          />
          <MenuButton
            color={menuColors[3]}
            name={menu_checkdam}
            onPress={() => presentResourceScreen('Checkdams', ResourceType.checkdam)}
          />
        </View>
      </View>
    );
  }



  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        // backgroundColor: 'tomato',
        alignContent: 'center',
      }}>
        {this.getMenuButtons()}
      </View>
    )
  }

}


//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
    menu_well: state.translation.templates.menu_well,
    menu_rainfall: state.translation.templates.menu_rainfall,
    menu_water_quality: state.translation.templates.menu_water_quality,
    menu_checkdam: state.translation.templates.menu_checkdam,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(HomeSimpleScreen);

const enhance = compose(
  withTabWrapper,
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(HomeSimpleScreen);
