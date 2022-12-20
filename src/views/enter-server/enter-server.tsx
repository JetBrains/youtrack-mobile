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
import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import ErrorMessageInline from 'components/error-message/error-message-inline';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import log from 'components/log/log';
import Popup from 'components/popup/popup';
import usage from 'components/usage/usage';
import {connectToNewYoutrack, openDebugView} from 'actions/app-actions';
import {formStyles} from 'components/common-styles/form';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {logo, IconBack} from 'components/icon/icon';
import {NETWORK_PROBLEM_TIPS} from 'components/error-message/error-text-messages';
import {resolveErrorMessage} from 'components/error/error-resolver';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';
import styles from './enter-server.styles';
import type {AppConfig} from 'types/AppConfig';
import type {Theme, UIThemeColors} from 'types/Theme';
const CATEGORY_NAME: string = 'Choose server';
const protocolRegExp = /^http(s?):\/\//i;
const CLOUD_DOMAINS: string[] = ['myjetbrains.com', 'youtrack.cloud'];
type Props = {
  serverUrl: string;
  connectToYoutrack: (newServerUrl: string) => Promise<AppConfig>;
  onShowDebugView: (...args: any[]) => any;
  onCancel: () => any;
};
type State = {
  serverUrl: string;
  connecting: boolean;
  error: string | null | undefined;
  isErrorInfoModalVisible: boolean;
};
const hitSlop = {
  top: UNIT,
  bottom: UNIT,
  left: UNIT,
  right: UNIT,
};
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

  getPossibleUrls(enteredUrl: string): string[] {
    const targetURL: string = enteredUrl.toLowerCase();
    const isCloudURL: boolean = CLOUD_DOMAINS.some(
      (it: string) => targetURL.indexOf(`.${it}`) !== -1,
    );
    let urls: string[];

    if (isCloudURL) {
      const url: string = targetURL.replace(protocolRegExp, '');
      urls = [`https://${url}`, `https://${url}/youtrack`];
    } else {
      if (!protocolRegExp.test(targetURL)) {
        urls = [
          `https://${targetURL}`,
          `https://${targetURL}/youtrack`,
          `http://${targetURL}`,
          `http://${targetURL}/youtrack`,
        ];
      } else {
        urls = [targetURL, `${targetURL}/youtrack`];
      }
    }

    return urls;
  }

  async onApplyServerUrlChange(): Promise<string | null | undefined> {
    if (!this.isValidInput()) {
      return;
    }

    this.setState({
      connecting: true,
      error: null,
    });
    const trimmedUrl = this.state.serverUrl.trim().replace(/\/$/i, '');
    const urlsToTry = this.getPossibleUrls(trimmedUrl);
    log.log(
      `Entered: "${this.state.serverUrl}", will try that urls: ${urlsToTry.join(
        ', ',
      )}`,
    );
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
    this.setState({
      error: errorMessage,
      connecting: false,
    });
    return errorMessage;
  }

  isValidInput(): any {
    const url = (this.state.serverUrl || '').trim();
    return url.length > 0 && !url.match(/@/g);
  }

  renderErrorInfoModalContent(): React.ReactNode {
    return (
      <React.Fragment>
        {NETWORK_PROBLEM_TIPS.map((tip: string, index: number) => {
          return (
            <Text
              key={`errorInfoTips-${index}`}
              style={styles.text}
            >{`${tip}\n`}</Text>
          );
        })}
      </React.Fragment>
    );
  }

  toggleErrorInfoModalVisibility: () => void = () => {
    const {isErrorInfoModalVisible} = this.state;
    this.setState({
      isErrorInfoModalVisible: !isErrorInfoModalVisible,
    });
  };

  render(): React.ReactNode {
    const {onShowDebugView, onCancel} = this.props;
    const {error, connecting, serverUrl, isErrorInfoModalVisible} = this.state;
    const isDisabled = connecting || !this.isValidInput();
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
          return (
            <ScrollView
              testID="test:id/enterServer"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.scrollContainer}
            >
              <View style={styles.container}>
                <View style={styles.backIconButtonContainer}>
                  {onCancel && (
                    <TouchableOpacity
                      testID="test:id/enterServerBackButton"
                      onPress={onCancel}
                      style={styles.backIconButton}
                    >
                      <IconBack />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formContent}>
                  <TouchableWithoutFeedback
                    testID="enterServerLogo"
                    onPress={() => clicksToShowCounter(onShowDebugView)}
                  >
                    <Image style={styles.logoImage} source={logo} />
                  </TouchableWithoutFeedback>

                  <View testID="test:id/enterServerHint">
                    <Text style={styles.title}>
                      {i18n(
                        'Enter the web address for a YouTrack installation where you have a registered account',
                      )}
                    </Text>
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
                    placeholder="my-youtrack-server.com"
                    placeholderTextColor={styles.placeholder.color}
                    returnKeyType="done"
                    keyboardType="url"
                    underlineColorAndroid="transparent"
                    onSubmitEditing={() => this.onApplyServerUrlChange()}
                    value={serverUrl}
                    onChangeText={serverUrl =>
                      this.setState({
                        serverUrl,
                        error: null,
                      })
                    }
                  />

                  <TouchableOpacity
                    style={[
                      formStyles.button,
                      isDisabled ? formStyles.buttonDisabled : null,
                    ]}
                    disabled={isDisabled}
                    testID="test:id/next"
                    accessibilityLabel="next"
                    accessible={true}
                    onPress={() => this.onApplyServerUrlChange()}
                  >
                    <Text
                      style={[
                        formStyles.buttonText,
                        isDisabled && formStyles.buttonTextDisabled,
                      ]}
                    >
                      {i18n('Next')}
                    </Text>
                    {connecting && (
                      <ActivityIndicator style={styles.progressIndicator} />
                    )}
                  </TouchableOpacity>

                  {Boolean(error) && (
                    <View style={styles.errorContainer}>
                      <ErrorMessageInline style={styles.error} error={error} />

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
                  )}
                </View>

                <View
                  testID="test:id/enterServerHelpLink"
                  style={styles.supportLinkContent}
                >
                  <TouchableOpacity
                    hitSlop={hitSlop}
                    onPress={() =>
                      Linking.openURL(
                        'https://www.jetbrains.com/help/youtrack/incloud/youtrack-mobile.html#start-using-youtrack-mobile',
                      )
                    }
                  >
                    <Text style={formStyles.link}>{i18n('Get help')}</Text>
                  </TouchableOpacity>
                </View>

                <View
                  testID="enterServerSupportLink"
                  style={styles.supportLinkContent}
                >
                  <TouchableOpacity
                    hitSlop={hitSlop}
                    onPress={() =>
                      Linking.openURL(
                        'https://youtrack-support.jetbrains.com/hc/en-us/requests/new',
                      )
                    }
                  >
                    <Text style={formStyles.link}>
                      {i18n('Contact support')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isErrorInfoModalVisible && (
                  <Popup
                    childrenRenderer={this.renderErrorInfoModalContent}
                    onHide={this.toggleErrorInfoModalVisibility}
                  />
                )}

                <KeyboardSpacer />
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

const mapDispatchToProps = dispatch => {
  return {
    connectToYoutrack: newURL => dispatch(connectToNewYoutrack(newURL)),
    onShowDebugView: () => dispatch(openDebugView()),
  };
};

// Needed to have a possibility to override callback by own props
const mergeProps = (stateProps, dispatchProps) => {
  return {...dispatchProps, ...stateProps};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EnterServer);
