import React, {useState, useRef, useEffect} from 'react';
import {TextInput} from 'react-native';

import {isIOSPlatform} from 'util/util';
import {UNIT} from 'components/variables';

import type {NativeSyntheticEvent, TextInputContentSizeChangeEventData, TextInputProps} from 'react-native';
import type {ViewStyleProp} from 'types/Internal';

const iOSPlatform: boolean = isIOSPlatform();
const MAX_DEFAULT_HEIGHT = 200;
const MIN_DEFAULT_HEIGHT = UNIT * 4;
const DEFAULT_FONT_SIZE = 16;

type Props = {
  adaptive?: boolean;
  maxInputHeight?: number;
  autoFocus?: boolean;
  style?: ViewStyleProp | ViewStyleProp[];
};

const MultilineInput = (props: Props) => {
  const {style, adaptive = true, maxInputHeight = MAX_DEFAULT_HEIGHT, autoFocus, ...rest} = props;

  const [inputHeight, setInputHeight] = useState<number | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const [selection, setSelection] = React.useState(!iOSPlatform ? {start: 0, end: 0} : undefined);
  const isFirstFocus = React.useRef(true);
  const textInputProps: TextInputProps = {...rest};

  if (!iOSPlatform) {
    textInputProps.onFocus = () => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        setSelection({start: 0, end: 0});
      }
      setSelection(undefined);
    };
  }

  useEffect(() => {
    if (autoFocus === true) {
      inputRef.current?.focus?.();
    }
  }, [autoFocus]);

  const onContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    if (!adaptive) {
      return;
    }
    let newHeight = event.nativeEvent.contentSize.height + UNIT;
    if (maxInputHeight > 0) {
      newHeight = newHeight > maxInputHeight ? maxInputHeight : Math.max(newHeight, MIN_DEFAULT_HEIGHT);
    }
    setInputHeight(Math.ceil(newHeight));
  };

  return (
    <TextInput
      {...textInputProps}
      returnKeyType={iOSPlatform ? 'default' : 'none'}
      ref={inputRef}
      testID="test:id/multiline-input"
      accessibilityLabel="multiline-input"
      accessible={true}
      multiline={true}
      selection={selection}
      onContentSizeChange={onContentSizeChange}
      style={[{fontSize: DEFAULT_FONT_SIZE}, style, adaptive ? {height: inputHeight} : null]}
    />
  );
};

export default React.memo(MultilineInput);
