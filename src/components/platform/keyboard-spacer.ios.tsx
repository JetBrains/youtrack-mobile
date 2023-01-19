import React from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {isIOSPlatform} from 'util/util';
export const keyboardSpacerTop: number = 98;
export default function KeyboardSpacerIOS(props: {top?: number}): JSX.Element | null {
  if (isIOSPlatform()) {
    const {top = keyboardSpacerTop} = props;
    return <KeyboardSpacer topSpacing={-top} />;
  }

  return null;
}
