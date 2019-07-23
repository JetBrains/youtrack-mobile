/* @flow */

import KeyboardSpacer from 'react-native-keyboard-spacer';
import React, {PureComponent} from 'react';

import {COLOR_BLACK} from '../variables/variables';
import {isIphoneX} from '../header/header__top-padding.ios';

import {Platform, StyleSheet} from 'react-native';


type Props = {}
export default class KeyboardSpacerIOS extends PureComponent<Props, void> {

  render() {
    if (Platform.OS === 'ios') {
      return <KeyboardSpacer topSpacing={isIphoneX ? -36 : 0} style={styles.keyboardSpacer}/>;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
  }
});
