/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {Dimensions} from 'react-native';

import KeyboardSpacer from 'react-native-keyboard-spacer';
import {isIOSPlatform} from '../../util/util';

export const keyboardSpacerTop: number = 98;

const X_XS_SIZE: number = 812;
const XS_MAX_XR_SIZE: number = 896;
const isIphoneX: boolean = [X_XS_SIZE, XS_MAX_XR_SIZE].includes(Dimensions.get('window').height);

type Props = {
  top?: number
}

export default class KeyboardSpacerIOS extends PureComponent<Props, void> {

  render(): null | Node {
    if (isIOSPlatform()) {
      const {top = keyboardSpacerTop} = this.props;
      return (
        <KeyboardSpacer
          topSpacing={isIphoneX ? -top : -keyboardSpacerTop}
        />
      );
    }
    return null;
  }
}
