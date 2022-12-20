import React, {useCallback, useContext, useEffect, useRef} from 'react';
import MultilineInput from '../multiline-input/multiline-input';
import {ThemeContext} from '../theme/theme-context';
import styles from './summary-description-form.style';
import type {Theme, UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  adaptive?: boolean;
  autoFocus?: boolean;
  editable: boolean;
  description: string;
  placeholderText?: string;
  multiline: boolean;
  onDescriptionChange: (text: string) => any;
  onSelectionChange?: (event: Record<string, any>) => any;
  style?: ViewStyleProp;
  uiTheme?: UITheme;
};

const TextEditForm = (props: Props): React.ReactNode => {
  const {onDescriptionChange = (text: string) => {}} = props;
  const timeout: {
    current: TimeoutID | null | undefined;
  } = useRef(null);
  const theme: Theme = useContext(ThemeContext);
  useEffect(() => {
    return clearTimeout(timeout.current);
  }, [timeout]);
  const onChange = useCallback(
    (text: string) => {
      timeout.current = setTimeout(() => {
        onDescriptionChange(text);
      }, 300);
    },
    [onDescriptionChange],
  );
  const {
    adaptive = false,
    autoFocus = false,
    description,
    editable = false,
    multiline = true,
    placeholderText = 'Description',
    style,
  } = props;
  return (
    <MultilineInput
      style={[styles.descriptionInput, style]}
      adaptive={adaptive}
      autoFocus={autoFocus}
      multiline={multiline}
      scrollEnabled={!adaptive}
      editable={editable}
      maxInputHeight={0}
      autoCapitalize="sentences"
      placeholderTextColor={theme.uiTheme.colors.$icon}
      placeholder={placeholderText}
      textAlignVertical="top"
      keyboardAppearance={theme.uiTheme.name}
      underlineColorAndroid="transparent"
      defaultValue={description}
      onChangeText={(text: string) => {
        clearTimeout(timeout.current);
        onChange(text);
      }}
      onSelectionChange={(event: Record<string, any>) => {
        if (props.onSelectionChange) {
          props.onSelectionChange(event);
        }
      }}
    />
  );
};

export default React.memo<Props>(TextEditForm) as React$AbstractComponent<
  Props,
  unknown
>;
