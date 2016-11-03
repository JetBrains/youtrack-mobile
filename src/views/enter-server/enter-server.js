/* @flow */
import {Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {logo} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import {resolveError, extractErrorMessage} from '../../components/notification/notification';

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
      return [enteredUrl, `${enteredUrl}/youtrack`];
    }

    return [
      `https://${enteredUrl}`,
      `https://${enteredUrl}/youtrack`,
      `http://${enteredUrl}`,
      `http://${enteredUrl}/youtrack`
    ];
  }

  async onApplyServerUrlChange() {
    this.setState({connecting: true});
    const urlsToTry = this.getPossibleUrls(this.state.serverUrl);
    log.log(`${this.state.serverUrl} entered, will try that urls: `, urlsToTry);

    let errorToShow = null;

    for (const url of urlsToTry) {
      log.log('Trying', url);
      try {
        await this.props.connectToYoutrack(url);
        log.log('Successfully connected to', url);
        return;
      } catch (error) {
        if (error && error.isIncompatibleYouTrackError) {
          errorToShow = error;
          break;
        }
        log.log(`Failed to connect to ${url}`, error);
        errorToShow = errorToShow || error;
      }
    }

    const error = await resolveError(errorToShow || {message: 'Unknown error'});
    this.setState({error, connecting: false});
  }

  getErrorMessage(error: Object) {
    return extractErrorMessage(error);
  }

  render() {

    const error = this.state.error ?
      <View style={styles.errorContainer}>
        <Text style={styles.error} selectable={true}>{this.getErrorMessage(this.state.error)}</Text>
      </View> :
      null;

    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps={true}>
        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        <View>
          <Text style={styles.title}>Enter YouTrack URL</Text>
        </View>

        <View>
          <TextInput
            autoCapitalize="none"
            autoFocus={true}
            selectTextOnFocus={true}
            autoCorrect={false}
            editable={!this.state.connecting}
            style={styles.input}
            placeholder="youtrack-example.com"
            returnKeyType="done"
            keyboardType="url"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.onApplyServerUrlChange()}
            value={this.state.serverUrl}
            onChangeText={(serverUrl) => this.setState({serverUrl})}/>

          {error}

          <TouchableOpacity style={[styles.apply, this.state.connecting ? styles.applyDisabled : {}]}
                            disabled={this.state.connecting}
                            onPress={this.onApplyServerUrlChange.bind(this)}>
            <Text style={styles.applyText}>Next</Text>
            {this.state.connecting && <ActivityIndicator style={styles.connectingIndicator}/>}
          </TouchableOpacity>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}
