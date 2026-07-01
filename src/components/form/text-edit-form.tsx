import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
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
  onDescriptionChange: (text: string) => void;
  onSelectionChange?: (event: Record<string, any>) => void;
  style?: ViewStyleProp;
  uiTheme?: UITheme;
};

const TextEditForm = (props: Props) => {
  const {onDescriptionChange = (text: string) => {}} = props;
  const [text, setText] = useState(props.description);
  const hasEditedText = useRef(false);
  const isFocused = useRef(false);
  const theme: Theme = useContext(ThemeContext);

  useEffect(() => {
    if ((!hasEditedText.current || !isFocused.current) && props.description !== text) {
      setText(props.description);
    }
  }, [props.description, text]);

  const onChange = useCallback(
    (text: string) => {
      hasEditedText.current = true;
      isFocused.current = true;
      setText(text);
      onDescriptionChange(text);
    },
    [onDescriptionChange],
  );
  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);
  const handleBlur = useCallback(() => {
    isFocused.current = false;
  }, []);
  const onSelectionChange = props.onSelectionChange;
  const handleSelectionChange = useCallback(
    (event: Record<string, any>) => {
      if (onSelectionChange) {
        onSelectionChange(event);
      }
    },
    [onSelectionChange],
  );
  const {
    adaptive = false,
    autoFocus = false,
    editable = false,
    multiline = true,
    placeholderText = 'Description',
    style,
  } = props;
  const inputStyle = useMemo(() => [styles.descriptionInput, style], [style]);

  return (
    <MultilineInput
      style={inputStyle}
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
      value={text}
      onChangeText={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default React.memo<Props>(TextEditForm);
