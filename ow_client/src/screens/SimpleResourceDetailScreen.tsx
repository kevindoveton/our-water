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
import { View } from 'react-native';
import {navigateTo, unwrapUserId, renderLog } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import ResourceDetailSection from '../components/ResourceDetailSection';
import { TranslationFile } from 'ow_translations';
import Loading from '../components/common/Loading';
import { SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions/index';
import { ActionMeta } from '../typings/Reducer';
import { AnyResource } from '../typings/models/Resource';
import { diff } from "deep-object-diff";
import { ResourceType } from '../enums';
import { isNullOrUndefined } from 'util';



export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  resourceId: string,
  isPending: boolean,
}

export interface StateProps {
  translation: TranslationFile,
  // resource: AnyResource | null,
  resourceType: ResourceType,
  meta: ActionMeta,
  userId: string,
}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<AnyResource>>
}

export interface State {

}

class SimpleResourceDetailScreen extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
    this.appApi = props.config.getAppApi();

    // this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);

    //Binds
    this.onAddReadingPressed = this.onAddReadingPressed.bind(this);
  }

  componentWillUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State, nextContext: any) {
    renderLog(`SimpleResourceDetailScreen componentDidUpdate, ${this.props.resourceId}, ${nextProps.resourceId}`);
    renderLog("     - ", diff(this.props, nextProps));
    renderLog("     - ", diff(this.state, nextState));

    if (this.props.resourceId !== nextProps.resourceId) {
      console.log("Getting new resource");
      this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);
    }
  }

  onAddReadingPressed(resourceId: string) { 
    const { resource_detail_new } = this.props.translation.templates;

    navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
      resourceId,
      resourceType: this.props.resourceType,
      config: this.props.config,
      userId: this.props.userId
    });
  }

  getResourceDetailSection() {
    const { meta, userId, isPending, translation: { templates: { resource_detail_new } } } = this.props;

    // if (meta.loading) {
    //   return (
    //     <Loading/>
    //   )
    // }

    // if (meta.error || !resource) {
    //   return (
    //     <View>
    //       <Text>{meta.errorMessage}</Text>
    //     </View>
    //   )
    // }

    return (
      <ResourceDetailSection
        config={this.props.config}
        hideTopBar={true}
        isPending={isPending}
        onAddReadingPressed={this.onAddReadingPressed}
        resourceId={this.props.resourceId}
        temporaryGroundwaterStationId={null}
      />
    );
  }

  render() {
    renderLog("SimpleResourceDetailScreen, render()");
    return (
      <View style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
      }}>
        {this.getResourceDetailSection()}
      </View>
    )
  }

}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  //Grab the resource from the list of resources
  let resource: AnyResource | null = null;
  let resourceMeta = state.resourceMeta;
  let meta = state.resourceMeta[ownProps.resourceId];
  if (!meta) {
    meta = { loading: false, error: true, errorMessage: 'Something went wrong.' };
  }
  console.log("State.resources", state.resources);
  console.log("ownProps.resourceId", ownProps.resourceId);
  
  //TD Hacky way to get the resource
  state.resources.forEach(r => {
    if (r.id === ownProps.resourceId) {
      resource = r;
    }
  });
  if (!resource) {
    state.recentResources.forEach(r => {
      if (r.id === ownProps.resourceId) {
        resource = r;
      }
    })
  }
  if (!resource) {
    state.favouriteResources.forEach(r => {
      if (r.id === ownProps.resourceId) {
        resource = r;
      }
    })
  }
  
  let resourceType: ResourceType = ResourceType.well;
  if (!isNullOrUndefined(resource) && resource.resourceType) {
    resourceType = resource.resourceType;
  }

  return {
    translation: state.translation,
    resourceType,
    meta,
    userId: unwrapUserId(state.user),
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getResource: (api: BaseApi, resourceId: string, userId: string) => {
      return dispatch(appActions.getResource(api, resourceId, userId));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceDetailScreen);
