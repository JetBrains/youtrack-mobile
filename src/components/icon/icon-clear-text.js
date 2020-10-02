import {TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

import {IconClose} from './icon';
import {UNIT} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';

import type {UITheme} from '../../flow/Theme';


export function iconClearText(onPress: (any) => any, uiTheme: UITheme) {
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={styles.icon}
    >
      <IconClose size={18} color={uiTheme.colors.$icon}/>
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
