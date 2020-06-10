/* @flow */

import KeyboardSpacer from 'react-native-keyboard-spacer';
import React, {PureComponent} from 'react';

import {COLOR_FONT_ON_BLACK} from '../variables/variables';
import {isIphoneX} from '../header/header__top-padding.ios';

import {StyleSheet} from 'react-native';
import {isIOSPlatform} from '../../util/util';

export const keyboardSpacerTop = 64;

type Props = {
  top?: number
}
export default class KeyboardSpacerIOS extends PureComponent<Props, void> {

  render() {
    if (isIOSPlatform()) {
      const top = this.props.top;
      return <KeyboardSpacer topSpacing={isIphoneX ? -(top || keyboardSpacerTop) : -keyboardSpacerTop} style={styles.keyboardSpacer}/>;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  keyboardSpacer: {
    backgroundColor: COLOR_FONT_ON_BLACK
  }
});
