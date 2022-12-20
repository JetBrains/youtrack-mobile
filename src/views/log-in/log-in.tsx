import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {Component} from 'react';
import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import ErrorMessageInline from 'components/error-message/error-message-inline';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Keystore from 'components/keystore/keystore';
import log from 'components/log/log';
import OAuth2 from 'components/auth/oauth2';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {connect} from 'react-redux';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {formatYouTrackURL} from 'components/config/config';
import {formStyles} from 'components/common-styles/form';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {logo, IconBack} from 'components/icon/icon';
import {openDebugView, onLogIn} from 'actions/app-actions';
import {resolveErrorMessage} from 'components/error/error-resolver';
import {ThemeContext} from 'components/theme/theme-context';
import styles from './log-in.styles';
import type {AppConfig} from 'flow/AppConfig';
import type {AuthParams, OAuthParams2} from 'flow/Auth';
import type {CustomError} from 'flow/Error';
import type {Node} from 'react';
import type {Theme, UIThemeColors} from 'flow/Theme';
type Props = {
  config: AppConfig;
  onLogIn: (authParams: OAuthParams2) => any;
  onShowDebugView: (...args: Array<any>) => any;
  onChangeServerUrl: (currentUrl: string) => any;
  errorMessage?: string;
  error?: CustomError;
};
type State = {
  username: string;
  password: string;
  errorMessage: string;
  loggingIn: boolean;
  youTrackBackendUrl: string;
};

const noop = () => {};

const CATEGORY_NAME = 'Login form';
export class LogIn extends Component<Props, State> {
  passInputRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errorMessage: props.errorMessage || '',
      loggingIn: false,
      youTrackBackendUrl: props.config.backendUrl,
    };
    const config: AppConfig = props.config;
    Keystore.getInternetCredentials(config.auth.serverUri).then(
      ({username, password}) =>
        this.setState({
          username,
          password,
        }),
      noop,
    );
    this.passInputRef = React.createRef();
    usage.trackScreenView('Login form');
  }

  async componentDidMount() {
    if (!this.isConfigHasClientSecret()) {
      await this.logInViaHub();
    }
  }

  isConfigHasClientSecret(): boolean {
    return !!this.props?.config?.auth?.clientSecret;
  }

  focusOnPassword: () => void = () => {
    this.passInputRef.current.focus();
  };
  logInViaCredentials: () => Promise<void> | Promise<any> = async () => {
    const {config, onLogIn} = this.props;
    const {username, password} = this.state;
    this.setState({
      loggingIn: true,
    });

    try {
      const authParams: OAuthParams2 = await OAuth2.obtainTokenByCredentials(
        username,
        password,
        config,
      );
      Keystore.setInternetCredentials(
        config.auth.serverUri,
        username,
        password,
      ).catch(noop);
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Success');
      authParams.inAppLogin = true;

      if (!authParams.accessTokenExpirationDate && authParams.expires_in) {
        authParams.accessTokenExpirationDate =
          Date.now() + authParams.expires_in * 1000;
      }

      onLogIn(authParams);
    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Error');
      const errorMessage: string = ERROR_MESSAGE_DATA[err.error]
        ? ERROR_MESSAGE_DATA[err.error].title
        : err.error_description || err.message;
      this.setState({
        errorMessage: errorMessage,
        loggingIn: false,
      });
    }
  };

  changeYouTrackUrl() {
    this.props.onChangeServerUrl(this.props.config.backendUrl);
  }

  async logInViaHub(): Promise<void> | Promise<any> {
    const {config, onLogIn} = this.props;
    const msg: string = 'Login via browser PKCE';

    try {
      this.setState({
        loggingIn: true,
      });
      const authParams: OAuthParams2 = await OAuth2.obtainTokenWithOAuthCode(
        config,
      );
      usage.trackEvent(CATEGORY_NAME, msg, 'Success');
      onLogIn(authParams);
    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, msg, 'Error');
      log.warn(msg, err);

      if (err.code === 'authentication_failed') {
        this.changeYouTrackUrl();
      } else {
        const errorMessage = await resolveErrorMessage(err);
        this.setState({
          loggingIn: false,
          errorMessage: errorMessage,
        });
      }
    }
  }

  render(): Node {
    const {onShowDebugView, config} = this.props;
    const {password, username, loggingIn, errorMessage} = this.state;
    const isLoginWithCreds: boolean = this.isConfigHasClientSecret();
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
          const hasNoCredentials: boolean = !username && !password;
          return (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View
                style={[
                  styles.container,
                  isLoginWithCreds ? null : styles.loadingContainer,
                ]}
              >
                <View style={styles.backIconButtonContainer}>
                  <TouchableOpacity
                    onPress={() => this.changeYouTrackUrl()}
                    style={styles.backIconButton}
                    testID="back-to-url"
                  >
                    <IconBack />
                  </TouchableOpacity>
                </View>

                <View
                  style={
                    isLoginWithCreds
                      ? styles.formContent
                      : styles.formContentCenter
                  }
                >
                  <TouchableWithoutFeedback
                    onPress={() => clicksToShowCounter(onShowDebugView)}
                  >
                    <Image style={styles.logoImage} source={logo} />
                  </TouchableWithoutFeedback>

                  <TouchableOpacity
                    style={styles.formContentText}
                    onPress={() => this.changeYouTrackUrl()}
                    testID="youtrack-url"
                  >
                    <Text style={styles.title}>
                      {i18n('Log in to YouTrack')}
                    </Text>
                    <Text style={styles.hintText}>
                      {formatYouTrackURL(config.backendUrl)}
                    </Text>
                  </TouchableOpacity>

                  {isLoginWithCreds && (
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loggingIn}
                      testID="test:id/login-input"
                      accessibilityLabel="login-input"
                      accessible={true}
                      style={styles.inputUser}
                      placeholder={i18n('Username or email')}
                      placeholderTextColor={uiThemeColors.$icon}
                      returnKeyType="next"
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => this.focusOnPassword()}
                      value={username}
                      onChangeText={(username: string) =>
                        this.setState({
                          username,
                        })
                      }
                    />
                  )}

                  {isLoginWithCreds && (
                    <TextInput
                      ref={this.passInputRef}
                      editable={!loggingIn}
                      testID="test:id/password-input"
                      accessibilityLabel="password-input"
                      accessible={true}
                      style={styles.inputPass}
                      placeholder={i18n('Password')}
                      placeholderTextColor={uiThemeColors.$icon}
                      returnKeyType="done"
                      underlineColorAndroid="transparent"
                      value={this.state.password}
                      onSubmitEditing={() => {
                        this.logInViaCredentials();
                      }}
                      secureTextEntry={true}
                      onChangeText={(password: string) =>
                        this.setState({
                          password,
                        })
                      }
                    />
                  )}

                  {isLoginWithCreds && (
                    <TouchableOpacity
                      style={[
                        formStyles.button,
                        (loggingIn || hasNoCredentials) &&
                          formStyles.buttonDisabled,
                      ]}
                      disabled={loggingIn || hasNoCredentials}
                      testID="test:id/log-in"
                      accessibilityLabel="log-in"
                      accessible={true}
                      onPress={this.logInViaCredentials}
                    >
                      <Text
                        style={[
                          formStyles.buttonText,
                          hasNoCredentials && formStyles.buttonTextDisabled,
                        ]}
                      >
                        {i18n('Log in')}
                      </Text>
                      {this.state.loggingIn && (
                        <ActivityIndicator style={styles.progressIndicator} />
                      )}
                    </TouchableOpacity>
                  )}

                  {!isLoginWithCreds &&
                    this.state.loggingIn &&
                    !this.state.errorMessage && (
                      <View style={styles.loadingMessage}>
                        <ActivityIndicator
                          style={styles.loadingMessageIndicator}
                          color={styles.loadingMessageIndicator.color}
                        />
                      </View>
                    )}

                  {isLoginWithCreds && (
                    <Text style={styles.hintText}>
                      {i18n('You need a YouTrack account to use the app.\n')}
                      <Text
                        style={formStyles.link}
                        onPress={() =>
                          Linking.openURL(
                            'https://www.jetbrains.com/company/privacy.html',
                          )
                        }
                      >
                        {i18n(
                          'By logging in, you agree to the Privacy Policy.',
                        )}
                      </Text>
                    </Text>
                  )}

                  {Boolean(errorMessage || hasNoCredentials) && (
                    <View style={styles.error}>
                      <ErrorMessageInline error={this.state.errorMessage} />
                    </View>
                  )}
                </View>
                {isLoginWithCreds && (
                  <TouchableOpacity
                    hitSlop={HIT_SLOP}
                    style={styles.support}
                    testID="test:id/log-in-via-browser"
                    accessibilityLabel="log-in-via-browser"
                    accessible={true}
                    onPress={() => this.logInViaHub()}
                  >
                    <Text style={styles.action}>
                      {i18n('Log in with Browser')}
                    </Text>
                  </TouchableOpacity>
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChangeServerUrl: youtrackUrl => {
      if (ownProps.onChangeServerUrl) {
        return ownProps.onChangeServerUrl(youtrackUrl);
      }

      Router.EnterServer({
        serverUrl: youtrackUrl,
      });
    },
    onLogIn: (authParams: AuthParams) => dispatch(onLogIn(authParams)),
    onShowDebugView: () => dispatch(openDebugView()),
  };
};

// Needed to have a possibility to override callback by own props
const mergeProps = (stateProps, dispatchProps) => {
  return {...dispatchProps, ...stateProps};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LogIn);