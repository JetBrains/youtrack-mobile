import {TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

import {IconClose} from './icon';
import {
  UNIT,
  COLOR_GRAY,
  COLOR_PLACEHOLDER,
  COLOR_FONT_ON_BLACK
} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';
import {isIOSPlatform} from '../../util/util';

const isIOS = isIOSPlatform();


export function iconClearText(onPress: (any) => any) {
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[
        styles.icon,
        isIOS ? styles.iconIOS : styles.iconAndroid
      ]}
    >
      <IconClose size={isIOS ? 9 : 18} color={isIOS ? COLOR_FONT_ON_BLACK : COLOR_PLACEHOLDER}/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: UNIT,
    marginRight: UNIT,
  },
  iconAndroid: {

  },
  iconIOS: {
    width: 14,
    height: 14,
    borderRadius: 16,
    backgroundColor: COLOR_GRAY,
  }
});
