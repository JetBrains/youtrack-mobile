/* @flow */

import React, {PureComponent} from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import {isIphoneX} from '../header/header__top-padding.ios';

import {isIOSPlatform} from '../../util/util';

export const keyboardSpacerTop = 64;

type Props = {
  top?: number
}
export default class KeyboardSpacerIOS extends PureComponent<Props, void> {

  render() {
    if (isIOSPlatform()) {
      const top = this.props.top;
      return (
        <KeyboardSpacer
          topSpacing={isIphoneX ? -(top || keyboardSpacerTop) : -keyboardSpacerTop}
        />
      );
    }
    return null;
  }
}
