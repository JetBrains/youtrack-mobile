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
import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import ErrorMessageInline from 'components/error-message/error-message-inline';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import log from 'components/log/log';
import OAuth2 from 'components/auth/oauth2';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_LOGIN_PAGE} from 'components/analytics/analytics-ids.ts';
import {connect} from 'react-redux';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {formatYouTrackURL} from 'components/config/config';
import {formStyles} from 'components/common-styles/form';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconBack, logo} from 'components/icon/icon';
import {onLogIn, openDebugView} from 'actions/app-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './log-in.styles';

import type {AppConfig} from 'types/AppConfig';
import type {AppState} from 'reducers';
import type {AuthParams} from 'types/Auth';
import type {CustomError} from 'types/Error';
import type {ReduxThunkDispatch} from 'types/Redux.ts';
import type {Theme, UIThemeColors} from 'types/Theme';

export interface Props {
  config: AppConfig;
  onLogIn: (authParams: AuthParams) => void;
  onShowDebugView: (...args: any[]) => any;
  onChangeServerUrl: (currentUrl: string) => any;
  errorMessage?: string;
  error?: CustomError;
}

interface State {
  username: string;
  password: string;
  errorMessage: string;
  loggingIn: boolean;
  youTrackBackendUrl: string;
}

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
    this.passInputRef = React.createRef();
    usage.trackScreenView('LoginForm');
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
      const authParams = await OAuth2.obtainTokenByCredentials(
        username,
        password,
        config,
      );
      usage.trackEvent(ANALYTICS_LOGIN_PAGE, 'Login via credentials successful');
      onLogIn(authParams);
    } catch (err) {
      usage.trackEvent(ANALYTICS_LOGIN_PAGE, 'Login via credentials error');
      usage.trackError(ANALYTICS_LOGIN_PAGE, err);
      let errorMessage: string = ERROR_MESSAGE_DATA.DEFAULT.title;
      const e = err as CustomError;
      if ('message' in e) {
        errorMessage = e.message;
      }
      if ('error_description' in e) {
        errorMessage = e.error_description;
      }
      this.setState({errorMessage, loggingIn: false});
    }
  };

  changeYouTrackUrl() {
    this.props.onChangeServerUrl(this.props.config.backendUrl);
  }

  async logInViaHub() {
    const {config, onLogIn} = this.props;
    const msg: string = 'Login via browser PKCE';

    try {
      this.setState({loggingIn: true});
      const authParams = await OAuth2.obtainTokenWithOAuthCode(config);
      usage.trackEvent(ANALYTICS_LOGIN_PAGE, msg, 'Success');
      onLogIn(authParams);
    } catch (err) {
      this.setState({loggingIn: false});
      usage.trackEvent(ANALYTICS_LOGIN_PAGE, msg, 'Error');
      usage.trackError(ANALYTICS_LOGIN_PAGE, err);
      log.warn(msg, err);
      this.changeYouTrackUrl();
    }
  }

  render(): React.ReactNode {
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
                          errorMessage: '',
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
                          errorMessage: '',
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

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {...ownProps};
};

const mapDispatchToProps = (dispatch: ReduxThunkDispatch, ownProps: Props) => {
  return {
    onChangeServerUrl: (youtrackUrl: string) => {
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

const mergeProps = (
  stateProps: Props,
  dispatchProps: {
    onChangeServerUrl: (youtrackUrl: string) => void;
    onLogIn: (authParams: AuthParams) => unknown;
    onShowDebugView: () => unknown;
  }
) => ({...dispatchProps, ...stateProps});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LogIn);
