/* @flow */

import type {Node} from 'React';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logo, IconBack} from '../../components/icon/icon';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import Popup from '../../components/popup/popup';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';
import {VERSION_DETECT_FALLBACK_URL} from '../../components/config/config';
import log from '../../components/log/log';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import {resolveErrorMessage} from '../../components/error/error-resolver';
import type {AppConfigFilled} from '../../flow/AppConfig';
import {connectToNewYoutrack, openDebugView} from '../../actions/app-actions';
import {NETWORK_PROBLEM_TIPS} from '../../components/error-message/error-text-messages';

import ErrorMessageInline from '../../components/error-message/error-message-inline';
import {View as AnimatedView} from 'react-native-animatable';

import {ThemeContext} from '../../components/theme/theme-context';

import {UNIT} from '../../components/variables/variables';
import {HIT_SLOP} from '../../components/common-styles/button';
import {formStyles} from '../../components/common-styles/form';

import styles from './enter-server.styles';

import type {Theme, UIThemeColors} from '../../flow/Theme';

const CATEGORY_NAME = 'Choose server';
const protocolRegExp = /^https?:/i;
const CLOUD_DOMAIN = 'myjetbrains.com';

type Props = {
  serverUrl: string,
  connectToYoutrack: (newServerUrl: string) => Promise<AppConfigFilled>,
  onShowDebugView: Function,
  onCancel: () => any
};

type State = {
  serverUrl: string,
  connecting: boolean,
  error: ?string,
  isErrorInfoModalVisible: boolean
};

const hitSlop = {top: UNIT, bottom: UNIT, left: UNIT, right: UNIT};

export class EnterServer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      serverUrl: props.serverUrl,
      connecting: false,
      error: null,
      isErrorInfoModalVisible: false,
    };

    usage.trackScreenView(CATEGORY_NAME);
    log.info('Entering server URL view has been opened');
  }

  getPossibleUrls(enteredUrl: string): Array<string> {
    if (protocolRegExp.test(enteredUrl)) {
      if (enteredUrl.indexOf('http:') === 0 && enteredUrl.indexOf(CLOUD_DOMAIN) !== -1) {
        enteredUrl = enteredUrl.replace('http:', 'https:');
        log.info('HTTP protocol was replaced for cloud instance', enteredUrl);
      }
      return [`${enteredUrl}/youtrack`, enteredUrl, `${enteredUrl}${VERSION_DETECT_FALLBACK_URL}`];
    }

    return [
      `https://${enteredUrl}/youtrack`,
      `https://${enteredUrl}`,

      `http://${enteredUrl}/youtrack`,
      `http://${enteredUrl}`,

      `http://${enteredUrl}${VERSION_DETECT_FALLBACK_URL}`,
    ];
  }

  async onApplyServerUrlChange() {
    if (!this.isValidInput()) {
      return;
    }
    this.setState({connecting: true, error: null});
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

    const errorMessage = await resolveErrorMessage(errorToShow);
    this.setState({error: errorMessage, connecting: false});
  }

  isValidInput(): any {
    const url = (this.state.serverUrl || '').trim();
    return url.length > 0 && !url.match(/@/g);
  }

  renderErrorInfoModalContent(): Node {
    return (
      <React.Fragment>
        {NETWORK_PROBLEM_TIPS.map((tip: string, index: number) => {
          return <Text key={`errorInfoTips-${index}`} style={styles.text}>{`${tip}\n`}</Text>;
        })}
      </React.Fragment>
    );
  }

  toggleErrorInfoModalVisibility: (() => void) = () => {
    const {isErrorInfoModalVisible} = this.state;
    this.setState({isErrorInfoModalVisible: !isErrorInfoModalVisible});
  };

  render(): Node {
    const {onShowDebugView, onCancel} = this.props;
    const {error, connecting, serverUrl, isErrorInfoModalVisible} = this.state;
    const isDisabled = connecting || !this.isValidInput();

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

          return (
            <ScrollView
              testID="enterServer"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.scrollContainer}
            >
              <View style={styles.container}>
                <View style={styles.backIconButtonContainer}>
                  {onCancel && (
                    <TouchableOpacity
                      testID="enterServerBackButton"
                      onPress={onCancel}
                      style={styles.backIconButton}
                    >
                      <IconBack/>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formContent}>
                  <TouchableWithoutFeedback
                    testID="enterServerLogo"
                    onPress={() => clicksToShowCounter(onShowDebugView)}
                  >
                    <Image style={styles.logoImage} source={logo}/>
                  </TouchableWithoutFeedback>

                  <View testID="enterServerHint">
                    <Text style={styles.title}>Enter your YouTrack server URL</Text>
                  </View>

                  <TextInput
                    testID="test:id/server-url"
                    accessibilityLabel="server-url"
                    accessible={true}
                    style={styles.input}
                    autoCapitalize="none"
                    autoFocus={true}
                    selectTextOnFocus={true}
                    autoCorrect={false}
                    placeholder="youtrack-server.com:PORT"
                    placeholderTextColor={styles.placeholder.color}
                    returnKeyType="done"
                    keyboardType="url"
                    underlineColorAndroid="transparent"
                    onSubmitEditing={() => this.onApplyServerUrlChange()}
                    value={serverUrl}
                    onChangeText={(serverUrl) => this.setState({serverUrl})}/>

                  <TouchableOpacity
                    style={[formStyles.button, isDisabled ? formStyles.buttonDisabled : null]}
                    disabled={isDisabled}
                    testID="test:id/next"
                    accessibilityLabel="next"
                    accessible={true}
                    onPress={() => this.onApplyServerUrlChange()}>
                    <Text style={[formStyles.buttonText, isDisabled && formStyles.buttonTextDisabled]}>Next</Text>
                    {connecting && <ActivityIndicator style={styles.progressIndicator}/>}
                  </TouchableOpacity>

                  {Boolean(error) && (
                    <AnimatedView
                      animation="fadeIn"
                      duration={500}
                      useNativeDriver
                    >
                      <View style={styles.errorContainer}>
                        <ErrorMessageInline
                          error={error}
                        />

                        <TouchableOpacity
                          style={styles.infoIcon}
                          hitSlop={HIT_SLOP}
                          onPress={this.toggleErrorInfoModalVisibility}
                        >
                          <IconMaterial
                            name="information"
                            size={24}
                            color={uiThemeColors.$iconAccent}
                          />
                        </TouchableOpacity>
                      </View>
                    </AnimatedView>
                  )}

                </View>

                <View
                  testID="enterServerSupportLink"
                  style={styles.supportLinkContent}
                >
                  <TouchableOpacity
                    hitSlop={hitSlop}
                    onPress={() => Linking.openURL('https://youtrack-support.jetbrains.com/hc/en-us/requests/new')}
                  >
                    <Text style={formStyles.link}>Contact support</Text>
                  </TouchableOpacity>
                </View>

                {isErrorInfoModalVisible && (
                  <Popup
                    childrenRenderer={this.renderErrorInfoModalContent}
                    onHide={this.toggleErrorInfoModalVisibility}
                  />
                )}

                <KeyboardSpacer/>
              </View>
            </ScrollView>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...ownProps};
};

const mapDispatchToProps = (dispatch) => {
  return {
    connectToYoutrack: newURL => dispatch(connectToNewYoutrack(newURL)),
    onShowDebugView: () => dispatch(openDebugView()),
  };
};

// Needed to have a possibility to override callback by own props
const mergeProps = (stateProps, dispatchProps) => {
  return {
    ...dispatchProps,
    ...stateProps,
  };
};

export default (connect(mapStateToProps, mapDispatchToProps, mergeProps)(EnterServer): any);
