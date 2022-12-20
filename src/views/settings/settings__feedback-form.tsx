import React, {PureComponent} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import InputScrollView from 'react-native-input-scroll-view';
import Header from 'components/header/header';
import Router from 'components/router/router';
import {
  feedbackLogsOptions,
  feedbackTypeOptions,
  sendFeedback,
} from './settings-helper';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconCheck, IconClose} from 'components/icon/icon';
import {notify, notifyError} from 'components/notification/notification';
import {showActions} from 'components/action-sheet/action-sheet';
import {until} from 'util/util';
import {HIT_SLOP} from 'components/common-styles/button';
import styles from './settings__feedback-form.styles';
import type {FeedbackLogs, FeedbackType} from './settings-helper';
import type {UITheme, UIThemeColors} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
type Feedback = {
  summary: string | null | undefined;
  email: string | null | undefined;
  type: FeedbackType;
  logs: FeedbackLogs;
  description: string | null | undefined;
};
type Props = {
  uiTheme: UITheme;
};
type State = {
  isFeedbackFormSending: boolean;
  isSubjectSelectorVisible: boolean;
  isLogsSelectorVisible: boolean;
  feedback: Feedback;
};
export default class SettingsFeedbackForm extends PureComponent<Props, State> {
  static contextTypes: any = {
    actionSheet: Function,
  };
  initialState: {
    feedback: Feedback;
    isFeedbackFormSending: boolean;
    isLogsSelectorVisible: boolean;
    isSubjectSelectorVisible: boolean;
  } = {
    isFeedbackFormSending: false,
    isSubjectSelectorVisible: false,
    isLogsSelectorVisible: false,
    feedback: {
      summary: null,
      email: null,
      type: feedbackTypeOptions[0],
      logs: feedbackLogsOptions[0],
      description: null,
    },
  };
  state: State = this.initialState;
  setSendingProgress: (isSending?: boolean) => void = (
    isSending: boolean = false,
  ) => {
    this.setState({
      isFeedbackFormSending: isSending,
    });
  };
  getContextActions: (isType: boolean) => any = (
    isType: boolean,
  ): Record<string, any> => {
    return (isType ? feedbackTypeOptions : feedbackLogsOptions)
      .map((action: Record<string, any>) => {
        const key: string = isType ? 'type' : 'logs';
        return {
          title: action.title,
          execute: () =>
            this.setState({
              feedback: {...this.state.feedback, [key]: action},
            }),
        };
      })
      .concat({
        title: i18n('Cancel'),
      });
  };
  renderContextActions: (isType: boolean) => Promise<void> = async (
    isType: boolean,
  ) => {
    const selectedAction = await showActions(
      this.getContextActions(isType),
      this.context.actionSheet(),
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
  close: () => any = () => Router.pop(true);
  onSendFeedback: () => Promise<void> | Promise<any> = async () => {
    this.setSendingProgress(true);
    const [error] = await until(sendFeedback(this.state.feedback));
    this.setSendingProgress(false);

    if (error) {
      notifyError(error);
    } else {
      notify(i18n('Thank you for your feedback!'));
      this.setState(this.initialState);
      this.close();
    }
  };

  render(): React.ReactNode {
    const {uiTheme} = this.props;
    const {feedback, isFeedbackFormSending} = this.state;
    const uiThemeColors: UIThemeColors = uiTheme.colors;
    const commonInputProps: Record<string, any> = {
      autoCapitalize: 'none',
      selectTextOnFocus: true,
      autoCorrect: false,
      placeholderTextColor: uiThemeColors.$icon,
      keyboardAppearance: uiTheme.name,
    };
    const buttonStyle: ViewStyleProp[] = [
      styles.feedbackFormInput,
      styles.feedbackFormType,
    ];
    const iconAngleRight = (
      <IconAngleRight size={20} color={uiThemeColors.$icon} />
    );
    const isSummaryEmpty: boolean = !(feedback.summary || '').trim();
    const isEmailValid: boolean =
      !!feedback.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email);

    const update: (arg0: Partial<Feedback>) => void = (
      feedbackPartial: Record<string, any>,
    ) =>
      this.setState({
        feedback: {...feedback, ...feedbackPartial},
      });

    const disabled: boolean =
      isSummaryEmpty || isFeedbackFormSending || !isEmailValid;
    return (
      <>
        <Header
          style={styles.elevation1}
          title={i18n('Send Feedback')}
          leftButton={
            <IconClose
              size={21}
              color={
                isFeedbackFormSending
                  ? uiThemeColors.$disabled
                  : uiThemeColors.$link
              }
            />
          }
          onBack={() => !isFeedbackFormSending && this.close()}
          extraButton={
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              disabled={disabled}
              onPress={this.onSendFeedback}
            >
              {isFeedbackFormSending ? (
                <ActivityIndicator color={uiThemeColors.$link} />
              ) : (
                <IconCheck
                  size={20}
                  color={
                    disabled ? uiThemeColors.$disabled : uiThemeColors.$link
                  }
                />
              )}
            </TouchableOpacity>
          }
        />

        <InputScrollView
          topOffset={styles.feedbackFormBottomIndent.height}
          multilineInputStyle={styles.feedbackFormText}
          style={styles.feedbackContainer}
        >
          <View style={styles.feedbackForm}>
            <TouchableOpacity
              style={buttonStyle}
              onPress={() => this.renderContextActions(true)}
            >
              <Text
                testID="settingsFeedbackType"
                style={styles.feedbackFormText}
              >
                {feedback.type.title}
              </Text>
              {iconAngleRight}
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyle}
              onPress={() => this.renderContextActions(false)}
            >
              <Text style={styles.feedbackFormTextSup}>{i18n('Logs')}</Text>
              <Text
                testID="settingsFeedbackLogs"
                style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
              >
                {feedback.logs.title}
              </Text>
              {iconAngleRight}
            </TouchableOpacity>

            <TextInput
              testID="settingsFeedbackEmail"
              {...commonInputProps}
              style={styles.feedbackFormInput}
              placeholder={i18n('Email address for follow-up')}
              value={feedback.email}
              onChangeText={(value: string) =>
                update({
                  email: value,
                })
              }
            />

            <TextInput
              testID="settingsFeedbackSummary"
              {...commonInputProps}
              style={styles.feedbackFormInput}
              placeholder={i18n('Summary')}
              value={feedback.summary}
              onChangeText={(value: string) =>
                update({
                  summary: value,
                })
              }
            />

            <TextInput
              multiline
              textAlignVertical="top"
              testID="settingsFeedbackDescription"
              {...commonInputProps}
              style={[styles.feedbackFormInputDescription]}
              placeholder={i18n('Description')}
              onChangeText={(value: string) =>
                update({
                  description: value,
                })
              }
            />

            <View style={styles.feedbackFormBottomIndent} />
          </View>
        </InputScrollView>
      </>
    );
  }
}
