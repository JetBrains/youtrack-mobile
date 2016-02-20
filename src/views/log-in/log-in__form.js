import React, {Image, ScrollView, View, Text, TextInput, TouchableOpacity, Linking} from 'react-native'
import {logo} from '../../components/icon/icon';
import appConfig from '../../components/config/config';
import Keystore from '../../components/keystore/keystore';
import AppConfig from '../../components/config/config';
import OAuth from '../../components/auth/auth__oauth';

import styles from './log-in.styles';

const noop = () => {};

export default class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      errorMessage: ''
    };


    //This promise resolves on android only because it has different oauth model
    OAuth.checkIfBeingAuthorizing()
      .then(code => {
        return this.props.auth.authorizeOAuth(code)
          .catch(err => {
            this.setState({errorMessage: err.error_description});
            throw err;
          });
      })
      .then(() => {
        this.props.onLogIn()
      })
      .catch((err) => console.log(err));

    Keystore.getInternetCredentials(AppConfig.auth.serverUri)
      .then(({username, password}) => this.setState({username, password}), noop);
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        <Text style={styles.welcome}>
          Login to YouTrack
        </Text>

        <View style={styles.inputsContainer}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            style={styles.input}
            placeholder="Username"
            returnKeyType="next"
            onSubmitEditing={() => this.focusOnPassword()}
            value={this.state.username}
            onChangeText={(username) => this.setState({username})}/>
          <TextInput
            ref="passInput"
            style={styles.input}
            placeholder="Password"
            returnKeyType="done"
            value={this.state.password}
            onSubmitEditing={() => this.logInViaCredentials()}
            password={true} onChangeText={(password) => this.setState({password})}/>
          {this.state.errorMessage ? <View><Text style={styles.error}>{this.state.errorMessage}</Text></View> : null}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.signin} onPress={this.logInViaCredentials.bind(this)}>
            <Text
              style={styles.signinText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkContainer} onPress={this.logInViaHub.bind(this)}>
            <Text style={styles.linkLike}>
              Log in via Browser</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkContainer} onPress={this.signUp.bind(this)}>
            <Text style={styles.linkLike}>
              Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkContainer} onPress={this.loginAsGuest.bind(this)}>
            <Text style={styles.linkLike}>
              Log in as guest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>You can log in with your credentials for JetBrains Account,
            Active Directory (Domain) Labs or Attlassian Jira</Text>
        </View>

      </ScrollView>
    );
  }

  focusOnPassword() {
    this.refs.passInput.focus();
  }

  logInViaCredentials() {
    this.props.auth.authorizeCredentials(this.state.username, this.state.password)
      .then(() => {
        return Keystore.setInternetCredentials(AppConfig.auth.serverUri, this.state.username, this.state.password)
          .catch(noop);
      })
      .then(() => this.props.onLogIn())
      .catch(err => this.setState({errorMessage: err.error_description}))
  }

  logInViaHub() {
    const config = this.props.auth.config;
    return OAuth.authorizeInHub(config)
      .then(code => this.props.auth.authorizeOAuth(code))
      .then(() => this.props.onLogIn())
      .catch(err => this.setState({errorMessage: err.error_description}))
  }

  signUp() {
    Linking.openURL(`${appConfig.auth.serverUri}/auth/register`);
  }

  loginAsGuest() {
    console.log('TODO: Not implemented');
  }
}
