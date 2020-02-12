/* @flow */

import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableWithoutFeedback
} from 'react-native';
import React, {Component} from 'react';
import Auth from '../../components/auth/auth';
import Router from '../../components/router/router';
import {connect} from 'react-redux';
import {formatYouTrackURL} from '../../components/config/config';
import {logo} from '../../components/icon/icon';
import Keystore from '../../components/keystore/keystore';
import authorizeInHub from '../../components/auth/auth__oauth';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import {openDebugView, applyAuthorization} from '../../actions/app-actions';
import {LOG_IN_2FA_TIP} from '../../components/error-message/error-text-messages';

import {resolveErrorMessage} from '../../components/notification/notification';
import ErrorMessageInline from '../../components/error-message/error-message-inline';

import type {AuthParams} from '../../components/auth/auth';

import {COLOR_PINK} from '../../components/variables/variables';
import BackIcon from '../../components/menu/back-icon';

import styles from './log-in.styles';
import {formStyles} from '../../components/common-styles/form';

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
      const errorMessage = err.error_description || err.message;
      this.setState({errorMessage: errorMessage, loggingIn: false});
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
      const errorMessage = await resolveErrorMessage(err);
      this.setState({loggingIn: false, errorMessage: errorMessage});
    }
  }

  render() {
    const {onShowDebugView} = this.props;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => this.changeYouTrackUrl()}
            style={styles.backIconButton}
            testID="back-to-url"
          >
            <BackIcon color={COLOR_PINK}/>
          </TouchableOpacity>

          <View style={styles.formContent}>
            <TouchableWithoutFeedback onPress={() => clicksToShowCounter(onShowDebugView)}>
              <Image style={styles.logoImage} source={logo}/>
            </TouchableWithoutFeedback>

            <TouchableOpacity onPress={() => this.changeYouTrackUrl()} testID="youtrack-url">
              <Text style={styles.title}>Login to YouTrack</Text>
              <Text
                style={styles.hintText}>{formatYouTrackURL(this.props.auth.config.backendUrl)}</Text>
            </TouchableOpacity>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!this.state.loggingIn}
              testID="login-input"
              style={styles.inputUser}
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
              style={styles.inputPass}
              placeholder="Password"
              returnKeyType="done"
              underlineColorAndroid="transparent"
              value={this.state.password}
              onSubmitEditing={() => {
                this.logInViaCredentials();
              }}
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}/>

            {Boolean(this.state.errorMessage) && (
              <ErrorMessageInline
                error={this.state.errorMessage}
                tips={LOG_IN_2FA_TIP}
              />
            )}

            <TouchableOpacity
              style={[formStyles.button, this.state.loggingIn ? formStyles.buttonDisabled : null]}
              disabled={this.state.loggingIn}
              testID="log-in"
              onPress={() => this.logInViaCredentials()}>
              <Text
                style={formStyles.buttonText}>Log in</Text>
              {this.state.loggingIn && <ActivityIndicator style={styles.progressIndicator}/>}
            </TouchableOpacity>

            <Text style={styles.hintText}>
              {'You need a YouTrack account to use the app.\n By logging in, you agree to the '}
              <Text
                style={formStyles.link}
                onPress={() => Linking.openURL('https://www.jetbrains.com/company/privacy.html')}>
                Privacy Policy
              </Text>.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.support}
            testID="log-in-via-browser"
            onPress={() => this.logInViaHub()}
          >
            <Text style={styles.action}>
              Log in via Browser</Text>
          </TouchableOpacity>

          <KeyboardSpacer/>
        </View>
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
