import * as React from 'react';
import {
  View, KeyboardAvoidingView, ScrollView, Image,
} from 'react-native';
import {
  ListItem, Badge, Text,
} from 'react-native-elements';
import {
  navigateTo, showModal, showLighbox,
} from '../utils';
import { primary, primaryDark, error1, secondaryDark, secondary, secondaryText, bgLight, } from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import ExternalServiceApi from '../api/ExternalServiceApi';
import BaseApi from '../api/BaseApi';
import { EmptyLoginDetails, LoginDetails, ConnectionStatus, AnyLoginDetails } from '../typings/api/ExternalServiceApi';
import Loading from '../components/common/Loading';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import * as appActions from '../actions/index';
import { UserType } from '../typings/UserTypes';
import { SyncMeta } from '../typings/Reducer';
import { TranslationFile } from 'ow_translations/Types';
import Logo from '../components/common/Logo';

export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  translation: TranslationFile
}

export interface ActionProps {

}



export interface State {

}

class SettingsScreen extends React.Component<OwnProps & StateProps & ActionProps> {
  state: State = {

  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
    
    //Binds
    this.showConnectToServiceScreen = this.showConnectToServiceScreen.bind(this);
    this.showSyncScreen = this.showSyncScreen.bind(this);
    this.showLanguageSelector = this.showLanguageSelector.bind(this);
    this.showEditResourceScreen = this.showEditResourceScreen.bind(this);
  }

  showConnectToServiceScreen() {
    const {
      externalLoginDetails,
      translation: {
        templates: {
          settings_connect_to_pending_title,
        }
      }
    } = this.props;


    showModal(
      this.props,
      'screen.menu.ConnectToServiceScreen',
      settings_connect_to_pending_title,
      {
        config: this.props.config,
        //TODO: how to get the userId in here???
        userId: this.props.userId,
        isConnected: externalLoginDetails.status === ConnectionStatus.NO_CREDENTIALS,
      }
    )
  }

  /**
   * Connect to button is only available for variants which connect to external services
   * 
   * if already connected, displays a button that says "Connected to XYZ"
   */
  getConnectToButton() {
    const { 
      externalLoginDetails,
      externalLoginDetailsMeta: { loading },
      translation: { 
        templates: { 
          settings_connect_to_pending_title,
          settings_connect_to_connected_title,
          settings_connect_to_subtitle_error,
        } 
      }
    } = this.props;

    if (!this.props.config.getShowConnectToButton()) {
      return false;
    }

    let title = settings_connect_to_pending_title;
    let subtitle;
    if (externalLoginDetails.status !== ConnectionStatus.NO_CREDENTIALS) {
      title = settings_connect_to_connected_title;
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_ERROR) {
      subtitle = settings_connect_to_subtitle_error;
    }

    let leftIcon: any = {
      name: 'account-circle',
      color: secondaryText,
    };
    if (loading) {
      leftIcon = <Loading style={{paddingRight: 10}} size={'small'}/>
    }

    return (
      <ListItem
        title={title}
        onPress={this.showConnectToServiceScreen}
        disabled={loading}
        leftIcon={leftIcon}
        hideChevron={true}
        subtitle={subtitle}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  showSyncScreen() {
    const { translation: { templates: { settings_sync_heading } } } = this.props;

    showModal(
      this.props,
      'screen.menu.SyncScreen',
      settings_sync_heading,
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    )
  }

  getSyncButton() {
    const { translation: { templates: { settings_sync_heading}}} = this.props;

    const leftIcon: any = {
      name: 'sync',
      color: secondaryText,
    };

    return (
      <ListItem
        title={settings_sync_heading}
        onPress={this.showSyncScreen}
        disabled={false}
        leftIcon={leftIcon}
        hideChevron={true}
        // subtitle={''}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  showLanguageSelector() {
    showLighbox(
      this.props,
      'modal.SelectLanguageModal',
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    );
  }

  getLanguageButton() {
    return (
      <ListItem
        title="Language"
        onPress={this.showLanguageSelector}
        leftIcon={{
          name: 'language',
          color: secondaryText,
        }}
        hideChevron={true}
      />
    );
  }

  showEditResourceScreen() {
    const { translation: { templates: { settings_new_resource } } } = this.props;

    navigateTo(this.props, 'screen.menu.EditResourceScreen', settings_new_resource, {
      config: this.props.config,
      userId: this.props.userId,
    })
  }

  render() {
    const { translation: { templates: { settings_new_resource }}} = this.props;

    return (
      <KeyboardAvoidingView style={{
        flexDirection: 'column',
        // justifyContent: 'space-around',
        backgroundColor: bgLight,
        height: '100%',
        width: '100%'
      }}>
        {Logo(this.props.config.getApplicationName())}
        {this.getConnectToButton()}
        {this.getSyncButton()}
        <ListItem
          title={settings_new_resource}
          onPress={this.showEditResourceScreen}
          leftIcon={{
            name: 'create',
            color: secondaryText,
          }}
          hideChevron={true}
        />
        {this.getLanguageButton()}
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  let userId = '';
  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    userId,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);