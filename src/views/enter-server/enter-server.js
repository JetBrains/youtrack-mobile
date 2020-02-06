/* @flow */

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {back as backIcon, logo} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import {VERSION_DETECT_FALLBACK_URL} from '../../components/config/config';
import log from '../../components/log/log';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import {extractErrorMessage, resolveError} from '../../components/notification/notification';
import type {AppConfigFilled} from '../../flow/AppConfig';
import {connectToNewYoutrack, openDebugView} from '../../actions/app-actions';
import throttle from 'lodash.throttle';

import styles from './enter-server.styles';

const CATEGORY_NAME = 'Choose server';
const protocolRegExp = /^https?:/i;
const CLOUD_DOMAIN = 'myjetbrains.com';
export const NETWORK_PROBLEM_TIPS = [
  '\nMake sure that your YouTrack instance is available.',
  'URL address should match formats:\n • youtrack-example.com:PORT\n • XX.XX.XX.XXX:PORT'
];

type Props = {
  serverUrl: string,
  connectToYoutrack: (newServerUrl: string) => Promise<AppConfigFilled>,
  onShowDebugView: Function,
  onCancel: () => any
};

type State = {
  serverUrl: string,
  connecting: boolean,
  error: ?Object
};

export class EnterServer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      serverUrl: props.serverUrl,
      connecting: false,
      error: null
    };

    usage.trackScreenView(CATEGORY_NAME);
    log.info('Entering server URL view has been opened');
  }

  getPossibleUrls(enteredUrl: string) {
    if (protocolRegExp.test(enteredUrl)) {
      if (enteredUrl.indexOf('http:') === 0 && enteredUrl.indexOf(CLOUD_DOMAIN) !== -1) {
        enteredUrl = enteredUrl.replace('http:', 'https:');
        log.info('HTTP protocol was replaced for cloud instance', enteredUrl);
      }
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
    log.log(`Entered: "${this.state.serverUrl}", will try that urls: ${urlsToTry.join(', ')}`);

    let errorToShow = null;

    for (const url of urlsToTry) {
      log.log(`Trying: "${url}"`);
      try {
        await this.props.connectToYoutrack(url);
        log.log(`Successfully connected to ${url}`);
        return;
      } catch (error) {
        log.log(`Failed to connect to ${url}`, error);
        log.log(`Connection error for ${url}: ${error && error.toString()}`);
        if (error && error.isIncompatibleYouTrackError) {
          errorToShow = error;
          break;
        }
        errorToShow = errorToShow || error;
      }
    }

    const error = await resolveError(errorToShow || {message: 'Unknown error'});
    error.message = [error.message || ''].concat(NETWORK_PROBLEM_TIPS).join('\n');
    this.setState({error, connecting: false});
  }

  isValidInput() {
    return throttle(() => {
      const url = (this.state.serverUrl || '').trim();
      return url.length > 0 && !url.match(/@/g);
    }, 500)();
  }

  render() {
    const {onShowDebugView, onCancel} = this.props;
    const isDisabled = this.state.connecting || !this.isValidInput();

    const error = (
      this.state.error
        ? <View style={styles.errorContainer}>
          <Text
            style={styles.error} selectable={true}
            testID="error-message">
            {extractErrorMessage(this.state.error)}
          </Text>
        </View>
        : null
    );

    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={styles.backIconButton}
          >
            <Image style={styles.backIcon} source={backIcon}/>
          </TouchableOpacity>
        )}

        <View style={styles.logoContainer}>
          <TouchableWithoutFeedback
            onPress={() => clicksToShowCounter(onShowDebugView)}
          >
            <Image style={styles.logoImage} source={logo}/>
          </TouchableWithoutFeedback>
        </View>

        <View>
          <Text style={styles.title}>Enter YouTrack URL</Text>
        </View>
        <View>
          <Text style={styles.hintText}>
            Requires YouTrack 2016.2 or later
          </Text>
        </View>
        <View>
          <TextInput
            testID="server-url"
            autoCapitalize="none"
            autoFocus={true}
            selectTextOnFocus={true}
            autoCorrect={false}
            style={styles.input}
            placeholder="youtrack-example.com:PORT"
            returnKeyType="done"
            keyboardType="url"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.onApplyServerUrlChange()}
            value={this.state.serverUrl}
            onChangeText={(serverUrl) => this.setState({serverUrl})}/>

          {error}

          <TouchableOpacity
            style={[styles.apply, isDisabled ? styles.applyDisabled : {}]}
            disabled={isDisabled}
            testID="next"
            onPress={() => this.onApplyServerUrlChange()}>
            <Text style={styles.applyText}>Next</Text>
            {this.state.connecting && <ActivityIndicator style={styles.connectingIndicator}/>}
          </TouchableOpacity>

          <View>
            <View>
              <Text style={styles.hintText}>
                You can also use IP address XX.XX.XX.XXX:PORT
              </Text>
            </View>

          </View>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...ownProps};
};

const mapDispatchToProps = (dispatch) => {
  return {
    connectToYoutrack: newURL => dispatch(connectToNewYoutrack(newURL)),
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EnterServer);
