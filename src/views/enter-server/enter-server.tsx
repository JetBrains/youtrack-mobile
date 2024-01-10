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
import React from 'react';

import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {useDispatch} from 'react-redux';

import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import ErrorMessageInline from 'components/error-message/error-message-inline';
import log from 'components/log/log';
import Popup from 'components/popup/popup';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {canGoBack} from 'components/navigation/navigator';
import {connectToNewYoutrack, openDebugView} from 'actions/app-actions';
import {formStyles} from 'components/common-styles/form';
import {getPossibleUrls, isValidURL} from 'views/enter-server/enter-server-helper';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {logo, IconBack} from 'components/icon/icon';
import {NETWORK_PROBLEM_TIPS} from 'components/error-message/error-text-messages';
import {resolveErrorMessage} from 'components/error/error-resolver';
import {StorageState} from 'components/storage/storage';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './enter-server.styles';

import type {Theme, UIThemeColors} from 'types/Theme';
import {INavigationParams, mixinNavigationProps} from 'components/navigation';


interface Props extends INavigationParams {
  serverUrl: string;
  currentAccount?: StorageState;
}

interface State {
  serverUrl: string;
  connecting: boolean;
  error: string | null | undefined;
  isErrorInfoModalVisible: boolean;
}

const CATEGORY_NAME: string = 'Choose server';


const EnterServer = (props: Props) => {
  console.log('>>>>>> EnterServer:currentAccount:RENDER', props.currentAccount);
  usage.trackScreenView(CATEGORY_NAME);
  log.info('Entering server URL view has been opened');

  const dispatch = useDispatch();

  const [state, updateState] = React.useState<State>({
    connecting: false,
    error: null,
    isErrorInfoModalVisible: false,
    serverUrl: props.serverUrl,
  });

  const doUpdateState = (statePartial: Partial<State> | State) => {
    updateState((st: State) => ({...st, ...statePartial}));
  };

  const onApplyServerUrlChange = async (): Promise<void> => {
    if (!isValidURL(state.serverUrl)) {
      return;
    }

    doUpdateState({
      connecting: true,
      error: null,
    });
    let errorToShow = null;
    const trimmedUrl: string = state.serverUrl.trim().replace(/\/$/i, '');

    for (const url of getPossibleUrls(trimmedUrl)) {
      log.log(`Trying: "${url}"`);
      try {
        console.log('>>>>>> EnterServer:currentAccount:CONNECT', props.currentAccount);
        await dispatch(connectToNewYoutrack(url, props.currentAccount));
        log.log(`Successfully connected to ${url}`);
        break;
      } catch (error) {
        log.log(`Failed to connect to ${url}`, error);
        if (error?.isIncompatibleYouTrackError) {
          errorToShow = error;
          break;
        }
        errorToShow = errorToShow || error;
      }
    }

    doUpdateState({
      error: await resolveErrorMessage(errorToShow),
      connecting: false,
    });
  };

  const renderErrorInfoModalContent = (): React.ReactNode => {
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
  };

  const toggleErrorInfoModalVisibility = (): void => {
    const {isErrorInfoModalVisible} = state;
    doUpdateState({
      isErrorInfoModalVisible: !isErrorInfoModalVisible,
    });
  };

  const {error, connecting, serverUrl, isErrorInfoModalVisible} = state;
  const isDisabled: boolean = connecting || !isValidURL(serverUrl);
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
              {canGoBack() && <View style={styles.backIconButtonContainer}>
                <TouchableOpacity
                  testID="test:id/enterServerBackButton"
                  onPress={Router.pop}
                  style={styles.backIconButton}
                >
                  <IconBack/>
                </TouchableOpacity>
              </View>}

              <View style={styles.formContent}>
                <TouchableWithoutFeedback
                  testID="enterServerLogo"
                  onPress={() => clicksToShowCounter(() => dispatch(openDebugView()))}
                >
                  <Image style={styles.logoImage} source={logo}/>
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
                  onSubmitEditing={() => onApplyServerUrlChange()}
                  value={serverUrl}
                  onChangeText={(serverUrl: string) => doUpdateState({
                    serverUrl,
                    error: null,
                  })}
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
                  onPress={() => {
                    onApplyServerUrlChange();
                  }}
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
                    <ActivityIndicator style={styles.progressIndicator}/>
                  )}
                </TouchableOpacity>

                {!!error && (
                  <View
                    testID="test:id/enterServerError"
                    style={styles.errorContainer}
                  >
                    <ErrorMessageInline style={styles.error} error={error}/>

                    <TouchableOpacity
                      style={styles.infoIcon}
                      hitSlop={HIT_SLOP}
                      onPress={toggleErrorInfoModalVisibility}
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
                  hitSlop={HIT_SLOP}
                  onPress={() => Linking.openURL(
                    'https://www.jetbrains.com/help/youtrack/incloud/youtrack-mobile.html#start-using-youtrack-mobile',
                  )}
                >
                  <Text style={formStyles.link}>{i18n('Get help')}</Text>
                </TouchableOpacity>
              </View>

              <View
                testID="enterServerSupportLink"
                style={styles.supportLinkContent}
              >
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  onPress={() => Linking.openURL(
                    'https://youtrack-support.jetbrains.com/hc/en-us/requests/new',
                  )}
                >
                  <Text style={formStyles.link}>
                    {i18n('Contact support')}
                  </Text>
                </TouchableOpacity>
              </View>

              {isErrorInfoModalVisible && (
                <Popup
                  childrenRenderer={renderErrorInfoModalContent}
                  onHide={toggleErrorInfoModalVisibility}
                />
              )}

              <KeyboardSpacer/>
            </View>
          </ScrollView>
        );
      }}
    </ThemeContext.Consumer>
  );
};


export default mixinNavigationProps(EnterServer);
