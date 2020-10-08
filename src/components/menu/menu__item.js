/* @flow */

import {TouchableOpacity, Text, View} from 'react-native';
import React from 'react';

import {HIT_SLOP} from '../common-styles/button';
import styles from './menu.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  icon: React$Element<any>,
  isActive?: boolean,
  label: string,
  onPress: () => any,
  style?: ViewStyleProp,
  testId?: string,
}


export const MenuItem = (props: Props) => {
  const {icon, isActive = false, onPress, style, testId, label} = props;

  return (
    <View
      testID={testId}
      style={[styles.menuItem, style]}
    >
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={[styles.menuItemButton, style]}
        onPress={onPress}
      >
        {icon}
        {isActive && <Text style={styles.menuItemLabel}>{label}</Text>}
      </TouchableOpacity>
    </View>
  );
};
