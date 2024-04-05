import React from 'react';
import {TextInput} from 'react-native';

import {ThemeContext} from 'components/theme/theme-context';

import styles from './form.style';

import {Theme} from 'types/Theme';

const FormTextInput = ({
  multiline,
  onChange,
  label,
  testID,
  value,
}: {
  multiline?: boolean;
  onChange: (text: string) => unknown;
  label?: string;
  testID?: string;
  value?: string | undefined;
}) => {
  const theme: Theme = React.useContext(ThemeContext);
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      keyboardAppearance={theme.uiTheme.name}
      placeholderTextColor={styles.icon.color}
      selectTextOnFocus
      textAlignVertical={multiline ? 'top' : undefined}
      testID={testID}
      style={[styles.feedbackFormInput, multiline && styles.feedbackFormInputDescription]}
      multiline={multiline}
      placeholder={label}
      value={value}
      onChangeText={onChange}
    />
  );
};

export default React.memo(FormTextInput);
