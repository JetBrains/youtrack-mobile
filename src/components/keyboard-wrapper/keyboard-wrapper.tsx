import React from 'react';
import {KeyboardAvoidingView} from 'react-native';

import {getKeyboardMargin} from 'components/responsive/responsive-helper';
import {headerMinHeight} from 'components/header/header.styles';
import {isIOSPlatform} from 'util/util';
import {menuHeight} from 'components/common-styles/header';

import styles from './keyboard-wrapper.styles';
import {ViewStyleProp} from 'types/Internal.ts';

const KeyboardWrapper = ({
  offset = 0,
  noHeader,
  children,
  style,
}: {
  offset?: number,
  noHeader?: boolean;
  children: React.ReactNode;
  style?: ViewStyleProp;
}) => {
  let deviceOffset = menuHeight + getKeyboardMargin();
  if (!noHeader) {
    deviceOffset += headerMinHeight;
  }
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={deviceOffset + offset}
      behavior={isIOSPlatform() ? 'padding' : undefined}
      style={[styles.container, style]}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default React.memo(KeyboardWrapper);
