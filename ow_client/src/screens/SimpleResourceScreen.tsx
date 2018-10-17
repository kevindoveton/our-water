/**
 * SimpleResourceScreen
 * 
 * Displays a list of the recent and favourite resources for the user's selected
 * resource type. If there are no recent or favourites, presents some text with an explanation
 * of how to find resources using the search or QR Code (and maybe map?)
 */

import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
import { ResourceType } from '../enums';
import FavouriteResourceList from '../components/FavouriteResourceList';
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { connect } from 'react-redux'
import { Resource } from '../typings/models/OurWater';



export interface OwnProps {
  userId: string,
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
  resourceType: ResourceType
}

export interface StateProps {

}

export interface ActionProps {

}



class SimpleResourceScreen extends Component<OwnProps & StateProps & ActionProps> {

  selectResource(resource: Resource) {

    //Navigate to a standalone resource view
    navigateTo(this.props, 'screen.SimpleResourceDetailScreen', resource.id, {
      resource,
      config: this.props.config,
      userId: this.props.userId
    });
  }

  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        flexDirection: 'column',
        flex: 1,
      }}>

        {/* TODO: add filter */}
        <FavouriteResourceList
          userId={this.props.userId}
          filterResourceType={this.props.resourceType}
          onResourceCellPressed={(r: Resource) => this.selectResource(r)}
        />
      </View>
    )
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
    //   dispatch(appActions.addRecent(api, userId, resource))
    // },
    // loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
    //   dispatch(appActions.getResources(api, userId, region)),
    // startExternalSync: (api: MaybeExternalServiceApi, userId: string) =>
    //   dispatch(appActions.startExternalSync(api, userId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceScreen);
