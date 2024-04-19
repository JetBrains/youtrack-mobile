import React from 'react';
import {
  InputModeOptions,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  View,
} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import FormTextInput from 'components/form/form-text-input';
import {IconAngleRight} from 'components/icon/icon';

import styles from './form.style';

import type {ViewStyleProp} from 'types/Internal';

const FormSelectButton = ({
  inputMode,
  label,
  multiline,
  onBlur,
  onChange = () => {},
  onClear,
  onFocus,
  onPress,
  required,
  style,
  testID,
  validator,
  value,
}: {
  inputMode?: InputModeOptions;
  label?: string;
  multiline?: boolean;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>, validationError: boolean) => void;
  onChange?: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onPress: () => void;
  required?: boolean;
  style?: ViewStyleProp;
  testID?: string;
  validator?: RegExp | ((v: string) => boolean) | null;
  value?: string;
}) => {
  return (
    <View style={[styles.formBlock, styles.formSelect, style]}>
      <TouchableOpacity onPress={onPress} style={styles.formSelectButton} testID={testID}>
        <FormTextInput
          editable={false}
          inputMode={inputMode}
          inputStyle={[label ? styles.formSelectText : null]}
          multiline={multiline}
          onBlur={onBlur}
          onChange={onChange}
          onClear={onClear}
          onFocus={onFocus}
          label={label}
          placeholder={label}
          required={required}
          validator={validator}
          value={value}
          wrapperStyle={styles.formSelect}
        />
      </TouchableOpacity>
      <IconAngleRight size={20} color={styles.formSelectIcon.color} style={styles.formSelectIcon} />
    </View>
  );
};

export default React.memo(FormSelectButton);
