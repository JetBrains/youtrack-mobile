/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import InputScrollView from 'react-native-input-scroll-view';

import Header from '../../components/header/header';
import Router from '../../components/router/router';
import {ERROR_MESSAGE_DATA} from '../../components/error/error-message-data';
import {feedbackLogsOptions, feedbackTypeOptions, sendFeedback} from './settings-helper';
import {IconAngleRight, IconCheck, IconClose} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';
import {showActions} from '../../components/action-sheet/action-sheet';
import {until} from '../../util/util';

import {HIT_SLOP} from '../../components/common-styles/button';

import styles from './settings__feedback-form.styles';

import type {FeedbackLogs, FeedbackType} from './settings-helper';
import type {UITheme, UIThemeColors} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Feedback = {
  summary: ?string,
  email: ?string,
  type: FeedbackType,
  logs: FeedbackLogs,
  description: ?string
};

type Props = {
  uiTheme: UITheme
};

type State = {
  isFeedbackFormSending: boolean,
  isSubjectSelectorVisible: boolean,
  isLogsSelectorVisible: boolean,
  feedback: Feedback
}


export default class SettingsFeedbackForm extends PureComponent<Props, State> {
  static contextTypes: any | {actionSheet: typeof Function} = {
    actionSheet: Function,
  };

  initialState: {
  feedback: Feedback,
  isFeedbackFormSending: boolean,
  isLogsSelectorVisible: boolean,
  isSubjectSelectorVisible: boolean,
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


  setSendingProgress: ((isSending?: boolean) => void) = (isSending: boolean = false) => {
    this.setState({isFeedbackFormSending: isSending});
  };

  getContextActions: ((isType: boolean) => any) = (isType: boolean): Object => {
    return (isType ? feedbackTypeOptions : feedbackLogsOptions).map((action: Object) => {
      const key: string = isType ? 'type' : 'logs';
      return (
        {
          title: action.title,
          execute: () => this.setState({
            feedback: {
              ...this.state.feedback,
              [key]: action,
            },
          }),
        }
      );
    }).concat({title: 'Cancel'});
  };

  renderContextActions: ((isType: boolean) => Promise<void>) = async (isType: boolean) => {
    const selectedAction = await showActions(this.getContextActions(isType), this.context.actionSheet());
    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };

  close: (() => any) = () => Router.pop(true);

  onSendFeedback: (() => Promise<void> | Promise<any>) = async () => {
    this.setSendingProgress(true);
    const [error] = await until(sendFeedback(this.state.feedback));
    this.setSendingProgress(false);
    if (error) {
      notify(ERROR_MESSAGE_DATA.DEFAULT.title);
    } else {
      notify('Thank you your feedback!');
      this.setState(this.initialState);
      this.close();
    }
  };

  render(): Node {
    const {uiTheme} = this.props;
    const {feedback, isFeedbackFormSending} = this.state;
    const uiThemeColors: UIThemeColors = uiTheme.colors;
    const commonInputProps: Object = {
      autoCapitalize: 'none',
      selectTextOnFocus: true,
      autoCorrect: false,
      placeholderTextColor: uiThemeColors.$icon,
      keyboardAppearance: uiTheme.name,
    };
    const buttonStyle: Array<ViewStyleProp> = [styles.feedbackFormInput, styles.feedbackFormType];
    const iconAngleRight = <IconAngleRight size={20} color={uiThemeColors.$icon}/>;
    const isSummaryEmpty: boolean = !(feedback.summary || '').trim();
    const isEmailValid: boolean = !!feedback.email && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(feedback.email);
    const update: ($Shape<Feedback>) => void = (feedbackPartial: Object) => this.setState({
      feedback: {
        ...feedback,
        ...feedbackPartial,
      },
    });

    const disabled: boolean = isSummaryEmpty || isFeedbackFormSending || !isEmailValid;
    return (
      <>
        <Header
          style={styles.elevation1}
          title="Send Feedback"
          leftButton={<IconClose size={21} color={isFeedbackFormSending ? uiThemeColors.$disabled : uiThemeColors.$link}/>}
          onBack={() => !isFeedbackFormSending && this.close()}
          extraButton={(
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              disabled={disabled}
              onPress={this.onSendFeedback}
            >
              {isFeedbackFormSending
                ? <ActivityIndicator color={uiThemeColors.$link}/>
                : <IconCheck size={20} color={disabled ? uiThemeColors.$disabled : uiThemeColors.$link}/>}
            </TouchableOpacity>
          )}
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
                style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
              >{feedback.logs.title}</Text>
              {iconAngleRight}
            </TouchableOpacity>

            <TextInput
              testID="settingsFeedbackEmail"
              {...commonInputProps}
              style={styles.feedbackFormInput}
              placeholder="Email address for follow-up"
              value={feedback.email}
              onChangeText={(value: string) => update({email: value})}
            />

            <TextInput
              testID="settingsFeedbackSummary"
              {...commonInputProps}
              style={styles.feedbackFormInput}
              placeholder="Summary"
              value={feedback.summary}
              onChangeText={(value: string) => update({summary: value})}
            />

            <TextInput
              multiline
              textAlignVertical="top"
              testID="settingsFeedbackDescription"
              {...commonInputProps}
              style={[styles.feedbackFormInputDescription]}
              placeholder="Description"
              onChangeText={(value: string) => update({description: value})}
            />

            <View style={styles.feedbackFormBottomIndent}/>
          </View>
        </InputScrollView>
      </>
    );
  }
}
