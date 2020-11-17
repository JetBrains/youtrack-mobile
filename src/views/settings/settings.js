/* @flow */

import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput
} from 'react-native';

import KeyboardSpacer from 'react-native-keyboard-spacer';

import * as AppActions from '../../actions/app-actions';
import Accounts from '../../components/account/accounts';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import Header from '../../components/header/header';
import ModalView from '../../components/modal-view/modal-view';
import MultilineInput from '../../components/multiline-input/multiline-input';
import usage, {VERSION_STRING} from '../../components/usage/usage';
import {AppVersion, until} from '../../util/util';
import {getStorageState} from '../../components/storage/storage';
import {getSystemThemeMode, themes} from '../../components/theme/theme';
import {IconAngleRight, IconCheck, IconClose} from '../../components/icon/icon';
import {feedbackLogsOptions, feedbackTypeOptions, sendFeedback} from './settings-helper';
import {showActions} from '../../components/action-sheet/action-sheet';
import {ThemeContext} from '../../components/theme/theme-context';

import {HIT_SLOP} from '../../components/common-styles/button';
import {elevation1} from '../../components/common-styles/shadow';
import styles from './settings.styles';

import PropTypes from 'prop-types';

import type {FeedbackLogs, FeedbackType} from './settings-helper';
import type {StorageState} from '../../components/storage/storage';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';
import {notify} from '../../components/notification/notification';
import {ERROR_MESSAGE_DATA} from '../../components/error/error-message-data';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Feedback = {
  summary: ?string,
  email: ?string,
  type: FeedbackType,
  logs: FeedbackLogs,
  description: ?string
};

type Props = {
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,
  openDebugView: () => any,
  openFeaturesView: () => any,

  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean
};

type State = {
  appearanceSettingsVisible: boolean,
  isFeedbackFormVisible: boolean,
  isFeedbackFormSending: boolean,
  isSubjectSelectorVisible: boolean,
  isLogsSelectorVisible: boolean,
  feedback: Feedback
}


class Settings extends PureComponent<Props, State> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  CATEGORY_NAME: string = 'Settings';
  initialState = {
    appearanceSettingsVisible: false,
    isFeedbackFormVisible: false,
    isFeedbackFormSending: false,
    isSubjectSelectorVisible: false,
    isLogsSelectorVisible: false,
    feedback: {
      summary: null,
      email: null,
      type: feedbackTypeOptions[0],
      logs: feedbackLogsOptions[0],
      description: null,
    }
  };
  state = this.initialState;

  constructor(props) {
    super(props);
    usage.trackScreenView(this.CATEGORY_NAME);
  }

  setAppearanceSettingsVisibility = (isVisible: boolean = false) => {
    this.setState({appearanceSettingsVisible: isVisible});
  };

  setShareFeedbackVisibility = (isVisible: boolean = false) => {
    this.setState({isFeedbackFormVisible: isVisible});
  };

  setSendingProgress = (isSending: boolean = false) => {
    this.setState({isFeedbackFormSending: isSending});
  };

  getUserThemeMode(): string {
    return getStorageState().themeMode || '';
  }

  renderThemeCheckbox(currentTheme: Theme, uiTheme: Object): any {
    const userThemeMode: ?string = this.getUserThemeMode();
    const mode: string = uiTheme.mode;
    const isChecked = (!userThemeMode && uiTheme.system) || (!uiTheme.system && !!userThemeMode && userThemeMode.indexOf(mode) !== -1);

    return (
      <TouchableOpacity
        key={mode}
        hitSlop={HIT_SLOP}
        onPress={async () => {
          currentTheme.setMode(uiTheme.mode, !!uiTheme.system);
        }}
      >
        <View style={styles.settingsListItemOption}>
          <Text style={styles.settingsListItemOptionText}>
            {`${uiTheme.name} theme`}
            {uiTheme.system && <Text style={styles.settingsListItemOptionTextSecondary}>{` (${uiTheme.mode})`}</Text>}
          </Text>
          {isChecked && <IconCheck size={20} color={currentTheme.uiTheme.colors.$link}/>}
        </View>
      </TouchableOpacity>
    );
  }

  renderAppearanceSettings = (theme: Theme) => {
    const systemTheme: Object = {name: 'System', mode: getSystemThemeMode(), system: true};

    return (
      <View>
        {[systemTheme].concat(themes).map((it: Object) => this.renderThemeCheckbox(theme, it))}
      </View>
    );
  };

  getContextActions = (isType: boolean) => {
    return (isType ? feedbackTypeOptions : feedbackLogsOptions).map((it: Object) => (
      {
        title: it.title,
        execute: () => this.setState({
          feedback: {
            ...this.state.feedback,
            [isType ? 'type' : 'logs']: it
          }
        })
      }
    )).concat({title: 'Cancel'});
  };

  renderContextActions = async (isType: boolean) => {
    const selectedAction = await showActions(this.getContextActions(isType), this.context.actionSheet());
    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };

  onSendFeedback = async () => {
    this.setSendingProgress(true);
    const [error] = await until(sendFeedback(this.state.feedback));
    this.setSendingProgress(false);
    if (error) {
      return notify(ERROR_MESSAGE_DATA.DEFAULT.title);
    }
    notify('Thank you your feedback!');
    this.setState(this.initialState);
  };

  renderFeedbackForm = (uiTheme: UITheme) => {
    const {feedback, isFeedbackFormSending} = this.state;
    const uiThemeColors: UIThemeColors = uiTheme.colors;
    const commonInputProps: Object = {
      autoCapitalize: 'none',
      selectTextOnFocus: true,
      autoCorrect: false,
      placeholderTextColor: uiThemeColors.$icon,
      keyboardAppearance: uiTheme.name
    };
    const buttonStyle: Array<ViewStyleProp> = [styles.feedbackFormInput, styles.feedbackFormType];
    const iconAngleRight = <IconAngleRight size={20} color={uiThemeColors.$icon}/>;
    const isSummaryEmpty: boolean = !(feedback.summary || '').trim();
    const update: ($Shape<Feedback>) => void = (feedbackPartial: Object) => this.setState({
      feedback: {
        ...feedback,
        ...feedbackPartial
      }
    });

    return (
      <ModalView
        animationType="slide"
      >
        <View style={styles.feedbackContainer}>
          <Header
            title="Send Feedback"
            leftButton={
              <IconClose
                size={21}
                color={isFeedbackFormSending ? uiThemeColors.$disabled : uiThemeColors.$link}
              />
            }
            onBack={() => !isFeedbackFormSending && this.setShareFeedbackVisibility(false)}
            extraButton={(
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                disabled={isSummaryEmpty || isFeedbackFormSending}
                onPress={this.onSendFeedback}
              >
                {isFeedbackFormSending
                  ? <ActivityIndicator color={uiThemeColors.$link}/>
                  : (<IconCheck
                    size={20}
                    color={isSummaryEmpty ? uiThemeColors.$disabled : uiThemeColors.$link}
                  />)}
              </TouchableOpacity>
            )}
          />

          <View style={styles.feedbackForm}>
            <TouchableOpacity
              style={buttonStyle}
              onPress={() => this.renderContextActions(true)}
            >
              <Text
                testID="settingsFeedbackType"
                style={styles.feedbackFormText}
              >{feedback.type.title}</Text>
              {iconAngleRight}
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyle}
              onPress={() => this.renderContextActions(false)}
            >
              <Text style={styles.feedbackFormTextSup}>Logs</Text>
              <Text
                testID="settingsFeedbackLogs"
                style={styles.feedbackFormText}
              >{feedback.logs.title}</Text>
              {iconAngleRight}
            </TouchableOpacity>

            <TextInput
              testID="settingsFeedbackEmail"
              {...commonInputProps}
              style={styles.feedbackFormInput}
              placeholder="Contact me with an email address (optional)"
              value={feedback.email}
              onChangeText={(value: string) => update({email: value})}
            />

            <TextInput
              testID="settingsFeedbackSummary"
              {...commonInputProps}
              autoFocus={true}
              style={styles.feedbackFormInput}
              placeholder="Summary"
              value={feedback.summary}
              onChangeText={(value: string) => update({summary: value})}
            />

            <View style={styles.feedbackFormDescription}>
              <MultilineInput
                testID="settingsFeedbackDescription"
                {...commonInputProps}
                style={[styles.feedbackFormInputDescription]}
                placeholder="Description"
                onChangeText={(value: string) => update({description: value})}
              />
            </View>

            <KeyboardSpacer/>
          </View>
        </View>
      </ModalView>
    );
  };

  render() {
    const {
      onAddAccount,
      onChangeAccount,
      onLogOut,
      openDebugView,
      openFeaturesView,

      otherAccounts,
      isChangingAccount
    } = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme;

          return (
            <View
              testID="settings"
              style={styles.settings}
            >
              <Header title="Settings"/>

              <View style={styles.settingsContent}>
                <Accounts
                  testID="settingsAccounts"
                  onAddAccount={onAddAccount}
                  onChangeAccount={onChangeAccount}
                  onClose={() => {}}
                  onLogOut={onLogOut}
                  openDebugView={openDebugView}
                  otherAccounts={otherAccounts}
                  isChangingAccount={isChangingAccount}
                  uiTheme={uiTheme}
                />

                <View style={styles.settingsList}>
                  {
                    [{
                      title: 'Appearance',
                      onPress: () => this.setAppearanceSettingsVisibility(true)
                    }, {
                      title: 'Share logs',
                      onPress: openDebugView
                    }, {
                      title: 'Send feedback',
                      onPress: () => this.setShareFeedbackVisibility(true)
                    }].map(it => (
                      <TouchableOpacity
                        key={it.title}
                        style={styles.settingsListItemTitle}
                        hitSlop={HIT_SLOP}
                        onPress={it.onPress}>
                        <Text style={styles.settingsListItemTitleText}>{it.title}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>

                <View
                  testID="settingsFooter"
                  style={styles.settingsFooter}
                >
                  <Text style={styles.settingsFooterTitle}>YouTrack Mobile {AppVersion}</Text>

                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://jetbrains.com/youtrack')}>
                    <Text style={styles.settingsFooterLink}>jetbrains.com/youtrack</Text>
                  </TouchableOpacity>

                  <TouchableWithoutFeedback
                    onPress={() => clicksToShowCounter(openFeaturesView, 'open features list')}
                  >
                    <Text style={styles.settingsFooterBuild}>{VERSION_STRING}</Text>
                  </TouchableWithoutFeedback>

                </View>
              </View>


              {this.state.appearanceSettingsVisible && (
                <ModalView
                  testID="popup"
                  animationType="fade"
                >
                  <Header
                    style={elevation1}
                    title="Appearance"
                    leftButton={
                      <IconClose style={styles.settingsAppearanceHeaderIcon} size={21} color={uiTheme.colors.$link}/>
                    }
                    onBack={this.setAppearanceSettingsVisibility}
                  />

                  <View style={styles.settingsAppearance}>
                    {this.renderAppearanceSettings(theme)}
                  </View>
                </ModalView>
              )}

              {this.state.isFeedbackFormVisible && this.renderFeedbackForm(uiTheme)}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    otherAccounts: state.app.otherAccounts,
    isChangingAccount: state.app.isChangingAccount
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLogOut: () => dispatch(AppActions.removeAccountOrLogOut()),
    onAddAccount: () => dispatch(AppActions.addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(AppActions.switchAccount(account)),
    openDebugView: () => dispatch(AppActions.openDebugView()),
    openFeaturesView: () => dispatch(AppActions.openFeaturesView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
