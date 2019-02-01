/* @flow */
import {Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking, TouchableWithoutFeedback} from 'react-native';
import React, {Component} from 'react';
import Auth from '../../components/auth/auth';
import Router from '../../components/router/router';
import {connect} from 'react-redux';
import {formatYouTrackURL} from '../../components/config/config';
import {logo, back} from '../../components/icon/icon';
import Keystore from '../../components/keystore/keystore';
import authorizeInHub from '../../components/auth/auth__oauth';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import {openDebugView, applyAuthorization} from '../../actions/app-actions';
import styles from './log-in.styles';

import type {AuthParams} from '../../components/auth/auth';

const noop = () => {};
const CATEGORY_NAME = 'Login form';

type Props = {
  auth: Auth,
  onLogIn: (authParams: AuthParams) => any,
  onShowDebugView: Function,
  onChangeServerUrl: (currentUrl: string) => any
};

type State = {
  username: string,
  password: string,
  errorMessage: string,
  loggingIn: boolean,
  youTrackBackendUrl: string
};

export class LogIn extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errorMessage: '',
      loggingIn: false,
      youTrackBackendUrl: props.auth.config.backendUrl
    };

    const config = props.auth.config;
    Keystore.getInternetCredentials(config.auth.serverUri)
      .then(({username, password}) => this.setState({username, password}), noop);

    usage.trackScreenView('Login form');
  }

  focusOnPassword() {
    this.refs.passInput.focus();
  }

  async logInViaCredentials() {
    const config = this.props.auth.config;
    this.setState({loggingIn: true});

    try {
      const authParams = await this.props.auth.obtainTokenByCredentials(this.state.username, this.state.password);
      Keystore.setInternetCredentials(config.auth.serverUri, this.state.username, this.state.password).catch(noop);
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Success');

      return this.props.onLogIn(authParams);
    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Error');
      this.setState({errorMessage: err.error_description || err.message, loggingIn: false});
    }
  }

  changeYouTrackUrl() {
    this.props.onChangeServerUrl(this.props.auth.config.backendUrl);
  }

  async logInViaHub() {
    const config = this.props.auth.config;

    try {
      const code = await authorizeInHub(config);
      this.setState({loggingIn: true});

      const authParams = await this.props.auth.obtainTokenByOAuthCode(code);
      usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Success');

      return this.props.onLogIn(authParams);
    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Error');
      this.setState({loggingIn: false, errorMessage: err.error_description || err.message});
    }
  }

  render() {
    const {onShowDebugView} = this.props;
    return (
      <ScrollView contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">

        <TouchableOpacity onPress={this.changeYouTrackUrl.bind(this)} style={styles.urlChangeButton} testID="back-to-url">
          <View style={styles.urlChangeWrapper}>
            <Image source={back} style={styles.urlChangeIcon}/>
            <Text style={styles.urlChangeText}>URL</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <TouchableWithoutFeedback onPress={() => clicksToShowCounter(onShowDebugView)}>
            <Image style={styles.logoImage} source={logo}/>
          </TouchableWithoutFeedback>
        </View>

        <TouchableOpacity onPress={this.changeYouTrackUrl.bind(this)} testID="youtrack-url">
          <View>
            <Text style={styles.welcome}>Login to YouTrack</Text>
            <Text style={[styles.descriptionText, {marginTop: 8}]}>{formatYouTrackURL(this.props.auth.config.backendUrl)}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputsContainer}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!this.state.loggingIn}
            testID="login-input"
            style={styles.input}
            placeholder="Username or email"
            returnKeyType="next"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.focusOnPassword()}
            value={this.state.username}
            onChangeText={(username) => this.setState({username})}/>
          <TextInput
            ref="passInput"
            editable={!this.state.loggingIn}
            testID="password-input"
            style={styles.input}
            placeholder="Password"
            returnKeyType="done"
            underlineColorAndroid="transparent"
            value={this.state.password}
            onSubmitEditing={() => {
              this.logInViaCredentials();
            }}
            secureTextEntry={true}
            onChangeText={(password) => this.setState({password})}/>

          {this.state.errorMessage
            ? <View><Text style={styles.error} selectable={true} testID="error-message">{this.state.errorMessage}</Text></View>
            : null}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.signin, this.state.loggingIn ? styles.signinDisabled : {}]}
            disabled={this.state.loggingIn}
            testID="log-in"
            onPress={this.logInViaCredentials.bind(this)}>
            <Text
              style={styles.signinText}>Log in</Text>
            {this.state.loggingIn && <ActivityIndicator style={styles.loggingInIndicator}/>}
          </TouchableOpacity>

          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              {'You need a YouTrack account to use the app.\n By logging in, you agree to the '}
              <Text style={styles.privacyPolicy} onPress={() => Linking.openURL('https://www.jetbrains.com/company/privacy.html')}>
                Privacy Policy
              </Text>.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.linkContainer}
            testID="log-in-via-browser"
            onPress={this.logInViaHub.bind(this)}
          >
            <Text style={styles.linkLike}>
              Log in via Browser</Text>
          </TouchableOpacity>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    auth: state.app.auth,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChangeServerUrl: youtrackUrl => {
      if (ownProps.onChangeServerUrl) {
        return ownProps.onChangeServerUrl(youtrackUrl);
      }
      Router.EnterServer({serverUrl: youtrackUrl});
    },
    onLogIn: authParams => dispatch(applyAuthorization(authParams)),
    onShowDebugView: () => dispatch(openDebugView())
  };
};

// Needed to have a possibility to override callback by own props
const mergeProps = (stateProps, dispatchProps) => {
  return {
    ...dispatchProps,
    ...stateProps
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LogIn);
