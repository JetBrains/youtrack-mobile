import React, {useCallback, useContext, useMemo} from 'react';
import {View, TextInput} from 'react-native';

import once from 'lodash.once';
import throttle from 'lodash.throttle';

import TextEditForm from './text-edit-form';
import usage from 'components/usage/usage';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './summary-description-form.style';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  analyticsId?: string;
  editable: boolean;
  summary: string;
  description: string;
  onSummaryChange: (summary: string) => void;
  onDescriptionChange: (description: string) => void;
  summaryPlaceholder?: string;
  descriptionPlaceholder?: string;
  style?: ViewStyleProp;
  testID?: string;
}

const DELAY: number = 300;

const SummaryDescriptionForm = (props: Props) => {
  const {
    editable,
    summary,
    description,
    summaryPlaceholder = 'Summary',
    descriptionPlaceholder = 'Description',
    onSummaryChange,
    onDescriptionChange,
    analyticsId,
    ...rest
  } = props;

  const theme = useContext(ThemeContext);

  const trackChange = useCallback(
    (message: string) => {
      if (typeof analyticsId === 'string') {
        usage.trackEvent(analyticsId, message);
      }
    },
    [analyticsId]
  );

  const trackSummaryChangeFn = useMemo(
    () => once(() => trackChange('Summary updated')),
    [trackChange]
  );

  const trackDescriptionChangeFn = useMemo(
    () => once(() => trackChange('Description updated')),
    [trackChange]
  );

  const throttledSummaryChange = useMemo(
    () => throttle((text: string) => {
      trackSummaryChangeFn();
      onSummaryChange(text);
    }, DELAY),
    [trackSummaryChangeFn, onSummaryChange]
  );

  const throttledDescriptionChange = useMemo(
    () => throttle((text: string) => {
      trackDescriptionChangeFn();
      onDescriptionChange(text);
    }, DELAY),
    [trackDescriptionChangeFn, onDescriptionChange]
  );

  const handleSummaryChange = useCallback(
    (text: string) => throttledSummaryChange(text),
    [throttledSummaryChange]
  );

  const handleDescriptionChange = useCallback(
    (text: string) => throttledDescriptionChange(text),
    [throttledDescriptionChange]
  );

  return (
    <View {...rest}>
      <TextInput
        style={styles.summary}
        multiline={true}
        editable={editable}
        autoFocus
        testID="test:id/issue-summary"
        accessible={true}
        placeholder={summaryPlaceholder}
        placeholderTextColor={styles.placeholder.color}
        underlineColorAndroid="transparent"
        keyboardAppearance={theme.uiTheme?.name || 'dark'}
        returnKeyType="next"
        autoCapitalize="sentences"
        defaultValue={summary}
        onChangeText={handleSummaryChange}
      />

      <View style={styles.separator} />

      <TextEditForm
        editable={editable}
        description={description}
        placeholderText={descriptionPlaceholder}
        multiline={true}
        onDescriptionChange={handleDescriptionChange}
      />
    </View>
  );
};

export default SummaryDescriptionForm;
