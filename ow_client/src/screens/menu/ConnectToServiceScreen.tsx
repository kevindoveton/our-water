import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView, ToastAndroid, Keyboard } from 'react-native';
import { primaryDark, primary, error1 } from '../../utils/Colors';
import { Text, FormInput, Button } from 'react-native-elements';
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
} from "react-reactive-form";
import BaseApi from '../../api/BaseApi';
import ExternalServiceApi from '../../api/ExternalServiceApi';
import { AppContext, SyncMeta } from '../../AppProvider';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, LoginDetailsType } from '../../typings/api/ExternalServiceApi';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';

export interface Props {
  navigator: any,
  config: ConfigFactory,
  userId: string,
  isConnected: boolean, //passed through to state,
  connectToExternalService: any,
  disconnectFromExternalService: any,
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
}

export interface State {
   username: string,
   password: string,
 }

export type TextInputParams = {
  handler: any, 
  touched: boolean,
  hasError: boolean,
  meta: any,
}

const TextInput = ({meta, handler}: any) => (
  <View>
    <FormInput autoCapitalize={'none'} secureTextEntry={meta.secureTextEntry} placeholder={`${meta.label}`}{...handler()}/>
  </View>
)

/**
 * ConnectToServiceScreen is a page allowing users to connect to external services
 * and manage their connection with these services.
 * 
 * For now, this implementation will be very GGMN-Specific, but can be adapted for other 
 * external services as OurWater expands.
 */
class ConnectToServiceScreen extends Component<Props> {
  state: State;
  loginForm: any;
  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: Props) {
    super(props);

    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    let username = '';
    if (this.props.externalLoginDetails.type === LoginDetailsType.FULL) {
      username = this.props.externalLoginDetails.username;
    }
    this.state = {
      username,
      password: '',
    };

    this.loginForm = FormBuilder.group({
      username: [username, Validators.required],
      password: ["", Validators.required],
    });
  }

  componentWillReceiveProps(newProps: Props) {
    const { username } = this.state;
    const { externalLoginDetails } = newProps;

    if (externalLoginDetails.type === LoginDetailsType.FULL) {

      //Update the username if we found a saved one.
      if (username !== externalLoginDetails.username) {
        this.setState({username: externalLoginDetails.username});
        this.loginForm.get('username').setValue(externalLoginDetails.username);
      }
    }
  }

  handleSubmit = async () => {
    Keyboard.dismiss();

    //Trying a more 'rusty' way of handling errors
    const result: SomeResult<null> = await this.props.connectToExternalService(this.loginForm.value.username, this.loginForm.value.password);
    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(`Sorry, could not log you in. ${result.message}`, ToastAndroid.SHORT);
      return;
    }

    this.setState({
      username: this.loginForm.value.username,
    });
  }

  handleLogout = () => {
    this.props.disconnectFromExternalService();
  }

  getLogo() {
    return (
      <View style={{
        alignSelf: 'center',
        width: 100,
        height: '30%',
        backgroundColor: primary,
      }} />
    )
  }

  /**
   * If the user was previously logged in but something went wrong, display an error message
   */
  getErrorMessage() {
    const { externalLoginDetails, externalLoginDetailsMeta: {loading} } = this.props;
    
    if (loading) {
      return null;
    }

    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_ERROR) {
      return null;
    }

    return (
      <Text style={{
        color: error1,
        paddingHorizontal: 20,
        paddingTop: 10,
      }}>
        Error signing in. Please try again.
      </Text>
    );
  }

  getConnectedSection() {
    let { username } = this.state;
    const { externalLoginDetails } = this.props;

    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
      return null;
    }

    if (username.length === 0) {
      username = externalLoginDetails.username;
    }

    const text = `You are connected to GGMN with username: ${username}`;
    return (
      <View
        style={{
          flex: 5,
        }}
      >
        <Text
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          {text}
        </Text>
        <Button
          title='Log out'
          onPress={() => this.handleLogout()}
        />
      </View>
    );
  }

  getForm() {
    const { externalLoginDetailsMeta: { loading }} = this.props;

    return (
      <FieldGroup
        strict={false}
        control={this.loginForm}
        render={({ get, invalid }) => (
          <View>
            <FieldControl
              name="username"
              render={TextInput}
              meta={{ label: "Username", secureTextEntry: false }}
            />
            <FieldControl
              name="password"
              render={TextInput}
              meta={{ label: "Password", secureTextEntry: true }}
            />
            <Button
              style={{
                paddingBottom: 20,
                minHeight: 50,
              }}
              loading={loading}
              disabled={invalid}
              title={loading ? '' : 'Submit'}
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}
      />
    )
  }

  // TODO: when to display this?
  // ToastAndroid.show(`Sorry, could not log you in. ${err.message}`, ToastAndroid.SHORT);

  render() {
    const { externalLoginDetails } = this.props;

    const isConnected = externalLoginDetails.status === ConnectionStatus.SIGN_IN_SUCCESS;  
    return (
      // <KeyboardAvoidingView
      //   style={{ flex: 1 }}
      //   // behavior="padding"
      //   keyboardVerticalOffset={-500}
      // >
        <ScrollView
          style={{
            flexDirection: 'column',
            // height: '100%',
          }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps={'always'}
        >
          {/* Logo */}
          <View style={{
            width: '100%',
            flex: 5,
            backgroundColor: primaryDark,
            justifyContent: 'center',
          }}>
            {this.getLogo()}
          </View>

          {/* Text */}
          <View style={{
            flex: 2
          }}>
            <Text style={{
              paddingHorizontal: 20,
              paddingTop: 10,
            }}>{this.props.config.getConnectToButtonDescription()}</Text>
            {this.getErrorMessage()}
            {this.getConnectedSection()}
          </View>
        
          {/* Form  */}
          <View style={{flex: 5}}>
            {isConnected ? null : this.getForm()}
          </View>
        </ScrollView>
      // </KeyboardAvoidingView>
    );
  }
}

const ConnectToServiceScreenWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({
        externalLoginDetails,
        externalLoginDetailsMeta,
        action_connectToExternalService,
        action_disconnectFromExternalService,
      }) => (
          <ConnectToServiceScreen
            externalLoginDetails={externalLoginDetails}
            externalLoginDetailsMeta={externalLoginDetailsMeta}
            connectToExternalService={action_connectToExternalService}
            disconnectFromExternalService={action_disconnectFromExternalService}
            {...props}
          />
        )}
    </AppContext.Consumer>
  );
};

export default ConnectToServiceScreenWithContext;