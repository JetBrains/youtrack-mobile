/* @flow */
import {Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {logo} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import {VERSION_DETECT_FALLBACK_URL} from '../../components/config/config';
import log from '../../components/log/log';
import {resolveError, extractErrorMessage} from '../../components/notification/notification';
import type {AppConfigFilled} from '../../flow/AppConfig';

import styles from './enter-server.styles';

const CATEGORY_NAME = 'Choose server';
const protocolRegExp = /^https?:/i;

type Props = {
  serverUrl: string,
  connectToYoutrack: (newServerUrl: string) => Promise<AppConfigFilled>,
  onCancel: () => any
};

type State = {
  serverUrl: string,
  connecting: boolean,
  error: ?Object
};

export default class EnterServer extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      serverUrl: props.serverUrl,
      connecting: false,
      error: null
    };

    usage.trackScreenView(CATEGORY_NAME);
  }

  getPossibleUrls(enteredUrl: string) {
    if (protocolRegExp.test(enteredUrl)) {
      return [enteredUrl, `${enteredUrl}/youtrack`, `${enteredUrl}${VERSION_DETECT_FALLBACK_URL}`];
    }

    return [
      `https://${enteredUrl}`,
      `https://${enteredUrl}/youtrack`,
      `http://${enteredUrl}`,
      `http://${enteredUrl}/youtrack`,
      `http://${enteredUrl}${VERSION_DETECT_FALLBACK_URL}`
    ];
  }

  async onApplyServerUrlChange() {
    if (!this.isValidInput()) {
      return;
    }
    this.setState({connecting: true});
    const trimmedUrl = this.state.serverUrl.trim().replace(/\/$/i, '');

    const urlsToTry = this.getPossibleUrls(trimmedUrl);
    log.log(`${this.state.serverUrl} entered, will try that urls: `, urlsToTry);

    let errorToShow = null;

    for (const url of urlsToTry) {
      log.log('Trying', url);
      try {
        await this.props.connectToYoutrack(url);
        log.log('Successfully connected to', url);
        return;
      } catch (error) {
        log.log(`Failed to connect to ${url}`, error);
        if (error && error.isIncompatibleYouTrackError) {
          errorToShow = error;
          break;
        }
        errorToShow = errorToShow || error;
      }
    }

    const error = await resolveError(errorToShow || {message: 'Unknown error'});
    this.setState({error, connecting: false});
  }

  isValidInput() {
    let {serverUrl} = this.state;
    if (!serverUrl) {
      return false;
    }
    serverUrl = serverUrl.trim();

    return serverUrl && !serverUrl.match(/@/g);
  }

  render() {

    const isDisabled = this.state.connecting || !this.isValidInput();

    const error = this.state.error ?
      <View style={styles.errorContainer}>
        <Text style={styles.error} selectable={true} testID="error-message">{extractErrorMessage(this.state.error)}</Text>
      </View> :
      null;

      return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        <View>
          <Text style={styles.title}>Enter YouTrack URL</Text>
        </View>

        <View>
          <TextInput
            testID="server-url"
            autoCapitalize="none"
            autoFocus={true}
            selectTextOnFocus={true}
            autoCorrect={false}
            style={styles.input}
            placeholder="youtrack-example.com"
            returnKeyType="done"
            keyboardType="url"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.onApplyServerUrlChange()}
            value={this.state.serverUrl}
            onChangeText={(serverUrl) => this.setState({serverUrl})}/>

          {error}

          <TouchableOpacity style={[styles.apply, isDisabled ? styles.applyDisabled : {}]}
                            disabled={isDisabled}
                            testID="next"
                            onPress={this.onApplyServerUrlChange.bind(this)}>
            <Text style={styles.applyText}>Next</Text>
            {this.state.connecting && <ActivityIndicator style={styles.connectingIndicator}/>}
          </TouchableOpacity>

          <View>
            <Text style={styles.hintText}>
              Requires YouTrack 7.0 or later
            </Text>
          </View>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}
