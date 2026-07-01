import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {View, TextInput} from 'react-native';

import once from 'lodash.once';

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
  const [summaryText, setSummaryText] = useState(summary);
  const [descriptionText, setDescriptionText] = useState(description);
  const hasEditedSummary = useRef(false);
  const isSummaryFocused = useRef(false);

  useEffect(() => {
    if ((!hasEditedSummary.current || !isSummaryFocused.current) && summary !== summaryText) {
      setSummaryText(summary);
    }
  }, [summary, summaryText]);

  useEffect(() => {
    setDescriptionText(description);
  }, [description]);

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

  const handleSummaryChange = useCallback(
    (text: string) => {
      hasEditedSummary.current = true;
      isSummaryFocused.current = true;
      setSummaryText(text);
      trackSummaryChangeFn();
      onSummaryChange(text);
    },
    [trackSummaryChangeFn, onSummaryChange]
  );

  const handleDescriptionChange = useCallback(
    (text: string) => {
      setDescriptionText(text);
      trackDescriptionChangeFn();
      onDescriptionChange(text);
    },
    [trackDescriptionChangeFn, onDescriptionChange]
  );

  const handleSummaryFocus = useCallback(() => {
    isSummaryFocused.current = true;
  }, []);

  const handleSummaryBlur = useCallback(() => {
    isSummaryFocused.current = false;
  }, []);

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
        value={summaryText}
        onChangeText={handleSummaryChange}
        onFocus={handleSummaryFocus}
        onBlur={handleSummaryBlur}
      />

      <View style={styles.separator} />

      <TextEditForm
        editable={editable}
        description={descriptionText}
        placeholderText={descriptionPlaceholder}
        multiline={true}
        onDescriptionChange={handleDescriptionChange}
      />
    </View>
  );
};

export default SummaryDescriptionForm;
