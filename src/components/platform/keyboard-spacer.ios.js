/* @flow */

import KeyboardSpacer from 'react-native-keyboard-spacer';
import React, {PureComponent} from 'react';

import {COLOR_BLACK} from '../variables/variables';
import {isIphoneX} from '../header/header__top-padding.ios';

import {StyleSheet} from 'react-native';
import {isIOSPlatform} from '../../util/util';

export const keyboardSpacerTop = 36;

type Props = {}
export default class KeyboardSpacerIOS extends PureComponent<Props, void> {

  render() {
    if (isIOSPlatform()) {
      return <KeyboardSpacer topSpacing={isIphoneX ? -keyboardSpacerTop : 0} style={styles.keyboardSpacer}/>;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
  }
});
