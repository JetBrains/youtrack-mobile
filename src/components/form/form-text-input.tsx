import React from 'react';
import {InputModeOptions, TextInput, View} from 'react-native';

import {IconClearText} from 'components/icon/icon-clear-text';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './form.style';

import {Theme} from 'types/Theme';

const FormTextInput = ({
  multiline,
  onChange,
  onFocus,
  onClear,
  label,
  placeholder,
  testID,
  value,
  inputMode = 'none',
}: {
  multiline?: boolean;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  testID?: string;
  value?: string;
  inputMode?: InputModeOptions;
}) => {
  const theme: Theme = React.useContext(ThemeContext);
  return (
    <View style={styles.formInputWrapper}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={styles.icon.color}
        selectTextOnFocus
        textAlignVertical={multiline ? 'top' : undefined}
        testID={testID}
        style={[
          styles.feedbackFormInput,
          multiline && styles.feedbackFormInputDescription,
          value && styles.formInputClearSpace,
        ]}
        multiline={multiline}
        placeholder={placeholder || label}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        inputMode={inputMode}
      />
      {onClear && value && <IconClearText onPress={onClear} style={styles.formInputClearIcon} />}
    </View>
  );
};

export default React.memo(FormTextInput);
