import {TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

import {IconClose} from './icon';
import {
  UNIT,
  COLOR_PLACEHOLDER
} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';


export function iconClearText(onPress: (any) => any) {
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={styles.icon}
    >
      <IconClose size={18} color={COLOR_PLACEHOLDER}/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: UNIT,
    marginRight: UNIT,
  }
});
