import React from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, TextInput} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useActionSheet} from '@expo/react-native-action-sheet';

import Header from 'components/header/header';
import Router from 'components/router/router';
import {ActionSheetOption} from 'components/action-sheet/action-sheet';
import {emailRegexp} from 'components/form/validate';
import {feedbackLogsOptions, feedbackTypeOptions, sendFeedback} from './settings-helper';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconBack, IconCheck} from 'components/icon/icon';
import {notify, notifyError} from 'components/notification/notification';
import {ThemeContext} from 'components/theme/theme-context';
import {until} from 'util/util';

import styles from './settings__feedback-form.styles';

import type {FeedbackData} from 'views/settings/settings-types';
import type {Theme, UIThemeColors} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

interface State {
  feedback: FeedbackData;
  isFeedbackFormSending: boolean;
  isLogsSelectorVisible: boolean;
  isSubjectSelectorVisible: boolean;
}

const SettingsFeedbackForm = () => {
  const theme: Theme = React.useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const buttonStyle: ViewStyleProp[] = [styles.feedbackFormInput, styles.feedbackFormType];

  const {showActionSheetWithOptions} = useActionSheet();

  const commonInputProps = {
    selectTextOnFocus: true,
    autoCorrect: false,
    placeholderTextColor: uiThemeColors.$icon,
    keyboardAppearance: theme.uiTheme.name,
  };

  const initialState: State = {
    feedback: {
      summary: '',
      email: '',
      type: feedbackTypeOptions[0],
      logs: feedbackLogsOptions[0],
    },
    isFeedbackFormSending: false,
    isLogsSelectorVisible: false,
    isSubjectSelectorVisible: false,
  };

  const [state, setState] = React.useState<State>(initialState);

  const setSendingProgress = (isSending: boolean = false) => {
    setState(prevState => ({
      ...prevState,
      isFeedbackFormSending: isSending,
    }));
  };

  const getContextActions = (isType: boolean): ActionSheetOption[] => {
    const actions = (isType ? feedbackTypeOptions : feedbackLogsOptions).map(action => {
      return {
        title: action.title,
        execute: () =>
          setState(prevState => ({
            ...prevState,
            feedback: {...prevState.feedback, [isType ? 'type' : 'logs']: action},
          })),
      };
    });
    return [...actions, {title: i18n('Cancel')}];
  };

  const renderContextActions = async (isType: boolean) => {
    const options = getContextActions(isType);
    showActionSheetWithOptions(
      {
        options: options.map(it => it.title),
        cancelButtonIndex: 2,
      },
      i => options[i!]?.execute?.()
    );
  };

  const navigateBack = () => Router.pop();

  const onSendFeedback = async () => {
    setSendingProgress(true);
    const [error] = await until(sendFeedback(state.feedback));
    setSendingProgress(false);

    if (error) {
      notifyError(error);
    } else {
      notify(i18n('Thank you for your feedback!'));
      setState(initialState);
      navigateBack();
    }
  };

  const onUpdate = (feedbackData: Partial<FeedbackData>) => {
    setState(prevState => ({
      ...prevState,
      feedback: {...prevState.feedback, ...feedbackData},
    }));
  };

  const isSendButtonDisabled = () => {
    return (
      state.isFeedbackFormSending || !(state.feedback.summary || '').trim() || !emailRegexp.test(state.feedback.email)
    );
  };

  const iconChevronRight = <IconAngleRight size={20} color={uiThemeColors.$icon} />;
  const disabled: boolean = isSendButtonDisabled();
  return (
    <>
      <Header
        style={styles.elevation1}
        title={i18n('Send Feedback')}
        leftButton={<IconBack color={state.isFeedbackFormSending ? uiThemeColors.$disabled : uiThemeColors.$link} />}
        onBack={() => !state.isFeedbackFormSending && navigateBack()}
        extraButton={
          <TouchableOpacity hitSlop={HIT_SLOP} disabled={disabled} onPress={onSendFeedback}>
            {state.isFeedbackFormSending ? (
              <ActivityIndicator color={uiThemeColors.$link} />
            ) : (
              <IconCheck color={disabled ? uiThemeColors.$disabled : uiThemeColors.$link} />
            )}
          </TouchableOpacity>
        }
      />

      <KeyboardAwareScrollView>
        <View style={styles.feedbackForm}>
          <TouchableOpacity style={buttonStyle} onPress={() => renderContextActions(true)}>
            <Text testID="settingsFeedbackType" style={styles.feedbackFormText}>
              {state.feedback.type.title}
            </Text>
            {iconChevronRight}
          </TouchableOpacity>

          <TouchableOpacity style={buttonStyle} onPress={() => renderContextActions(false)}>
            <Text style={styles.feedbackFormTextSup}>{i18n('Logs')}</Text>
            <Text testID="settingsFeedbackLogs" style={[styles.feedbackFormText, styles.feedbackFormTextMain]}>
              {state.feedback.logs.title}
            </Text>
            {iconChevronRight}
          </TouchableOpacity>

          <TextInput
            testID="settingsFeedbackEmail"
            {...commonInputProps}
            style={styles.feedbackFormInput}
            placeholder={i18n('Email address for follow-up')}
            value={state.feedback.email}
            onChangeText={(value: string) => onUpdate({email: value})}
          />

          <TextInput
            autoCapitalize="none"
            testID="settingsFeedbackSummary"
            {...commonInputProps}
            style={styles.feedbackFormInput}
            placeholder={i18n('Summary')}
            value={state.feedback.summary}
            onChangeText={(value: string) => onUpdate({summary: value})}
          />

          <TextInput
            autoCapitalize="none"
            multiline
            textAlignVertical="top"
            testID="settingsFeedbackDescription"
            {...commonInputProps}
            style={[styles.feedbackFormInput, styles.feedbackFormInputMultiline]}
            placeholder={i18n('Description')}
            onChangeText={(value: string) => onUpdate({description: value})}
          />

          <View style={styles.feedbackFormBottomIndent} />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default React.memo(SettingsFeedbackForm);
