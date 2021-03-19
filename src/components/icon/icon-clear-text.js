import {TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

import {IconClose} from './icon';
import {UNIT} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';


export function iconClearText(onPress: (any) => any, color: string) {
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={styles.icon}
    >
      <IconClose size={18} color={color}/>
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
});
