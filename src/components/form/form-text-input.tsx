import React from 'react';
import {TextInput, View} from 'react-native';

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
  testID,
  value,
}: {
  multiline?: boolean;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onClear?: () => void;
  label?: string;
  testID?: string;
  value?: string;
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
        placeholder={label}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
      />
      {onClear && value && <IconClearText onPress={onClear} style={styles.formInputClearIcon} />}
    </View>
  );
};

export default React.memo(FormTextInput);
