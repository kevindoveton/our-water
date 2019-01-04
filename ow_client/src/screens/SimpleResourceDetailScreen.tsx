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
import {navigateTo, unwrapUserId } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import ResourceDetailSection from '../components/ResourceDetailSection';
import { TranslationFile } from 'ow_translations';
import Loading from '../components/common/Loading';
import { SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions/index';
import { ActionMeta } from '../typings/Reducer';
import { AnyResource } from '../typings/models/Resource';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  resourceId: string,
}

export interface StateProps {
  translation: TranslationFile,
  resource: AnyResource | null,
  meta: ActionMeta,
  userId: string,
}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<AnyResource>>
}

export interface State {

}

class SimpleResourceDetailScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
    this.appApi = props.config.getAppApi();

    this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);

    //Binds
    this.onAddReadingPressed = this.onAddReadingPressed.bind(this);
  }

  componentDidUpdate(prevProps: OwnProps & StateProps & ActionProps, prevState: State, snapshot: any) {
    if (this.props.resourceId !== prevProps.resourceId) {
      this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);
    }
  }

  onAddReadingPressed(resourceId: string) { 
    const { resource_detail_new } = this.props.translation.templates;

    navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
      resourceId,
      resourceType: 'well',
      config: this.props.config,
      userId: this.props.userId
    });
  }

  getResourceDetailSection() {
    const { meta, userId, resource, translation: { templates: { resource_detail_new } } } = this.props;

    if (meta.loading) {
      return (
        <Loading/>
      )
    }

    if (meta.error || !resource) {
      return (
        <View>
          <Text>{meta.errorMessage}</Text>
        </View>
      )
    }

    return (
      <ResourceDetailSection
        config={this.props.config}
        hideTopBar={true}
        isPending={false}
        onAddReadingPressed={this.onAddReadingPressed}
        resourceId={resource.id}
        temporaryGroundwaterStationId={null}
      />
    );
  }

  render() {
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

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  //Grab the resource from the list of resources
  let resource = null;
  let resourceMeta = state.resourceMeta;
  let meta = state.resourceMeta[ownProps.resourceId];
  if (!meta) {
    meta = { loading: false, error: true, errorMessage: 'Something went wrong.' };
  }

  state.resources.forEach(r => {
    if (r.id === ownProps.resourceId) {
      resource = r;
    }
  });

  return {
    translation: state.translation,
    resource,
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
