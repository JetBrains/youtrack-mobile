/* @flow */
import {Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking} from 'react-native';
import React from 'react';
import Auth from '../../components/auth/auth';
import {formatYouTrackURL} from '../../components/config/config';
import {logo, back} from '../../components/icon/icon';
import Keystore from '../../components/keystore/keystore';
import authorizeInHub from '../../components/auth/auth__oauth';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';

import styles from './log-in.styles';

const noop = () => {};
const CATEGORY_NAME = 'Login form';

type Props = {
  auth: Auth,
  onLogIn: () => any,
  onChangeServerUrl: (currentUrl: string) => any
};

type State = {
  username: string,
  password: string,
  errorMessage: string,
  loggingIn: boolean,
  youTrackBackendUrl: string
};

export default class LoginForm extends React.Component {
  props: Props;
  state: State;

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

  logInViaCredentials() {
    const config = this.props.auth.config;
    this.setState({loggingIn: true});

    this.props.auth.authorizeCredentials(this.state.username, this.state.password)
      .then(() => {
        return Keystore.setInternetCredentials(config.auth.serverUri, this.state.username, this.state.password)
          .catch(noop);
      })
      .then(() => {
        usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Success');
        return this.props.onLogIn();
      })
      .catch(err => {
        usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Error');
        this.setState({errorMessage: err.error_description || err.message, loggingIn: false});
      });
  }

  changeYouTrackUrl() {
    this.props.onChangeServerUrl(this.props.auth.config.backendUrl);
  }

  logInViaHub() {
    const config = this.props.auth.config;

    return authorizeInHub(config)
      .then(code => {
        this.setState({loggingIn: true});
        return this.props.auth.authorizeOAuth(code);
      })
      .then(() => {
        usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Success');
        return this.props.onLogIn();
      })
      .catch(err => {
        usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Error');
        this.setState({loggingIn: false, errorMessage: err.error_description || err.message});
      });
  }

  render() {
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
          <Image style={styles.logoImage} source={logo}/>
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
            onSubmitEditing={() => this.logInViaCredentials()}
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
