import React from 'react';
import {InputModeOptions, NativeSyntheticEvent, TextInput, TextInputFocusEventData, View} from 'react-native';

import {IconClearText} from 'components/icon/icon-clear-text';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './form.style';

import {Theme} from 'types/Theme';

const FormTextInput = ({
  multiline,
  onChange,
  onFocus,
  onBlur,
  onClear,
  label,
  placeholder,
  testID,
  value,
  inputMode = 'none',
  validator,
  required,
}: {
  multiline?: boolean;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>, validationError: boolean) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  testID?: string;
  value?: string;
  inputMode?: InputModeOptions;
  validator?: RegExp | ((v: string) => boolean) | null;
  required?: boolean;
}) => {
  const theme: Theme = React.useContext(ThemeContext);
  const [hasError, setInvalid] = React.useState<boolean>(false);

  React.useEffect(() => {
    setInvalid(false);
  }, []);

  return (
    <View style={styles.formInputWrapper}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={hasError ? styles.feedbackInputError.borderColor : styles.icon.color}
        selectTextOnFocus
        textAlignVertical={multiline ? 'top' : undefined}
        testID={testID}
        style={[
          styles.feedbackFormInput,
          multiline && styles.feedbackFormInputDescription,
          value && styles.formInputClearSpace,
          hasError && styles.feedbackInputError,
        ]}
        multiline={multiline}
        placeholder={placeholder || label}
        value={value}
        onChangeText={(t) => {
          onChange?.(t);
          setInvalid(false);
        }}
        onFocus={onFocus}
        onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
          let isInvalid: boolean = false;
          const v = (value || '').trim();
          if (v) {
            isInvalid = validator instanceof RegExp ? !validator.test(v) : false;
            if (validator instanceof RegExp) {
              isInvalid = !validator.test(v);
            }
            if (typeof validator === 'function') {
              isInvalid = !validator(v);
            }
          } else if (required) {
            isInvalid = true;
          }
          setInvalid(isInvalid);
          onBlur?.(e, isInvalid);
        }}
        inputMode={inputMode}
      />
      {onClear && value && (
        <IconClearText
          onPress={() => {
            onClear();
            setInvalid(false);
          }}
          style={styles.formInputClearIcon}
        />
      )}
    </View>
  );
};

export default React.memo(FormTextInput);
