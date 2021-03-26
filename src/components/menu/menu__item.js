/* @flow */

import {TouchableOpacity, View} from 'react-native';
import React from 'react';

import {HIT_SLOP} from '../common-styles/button';
import styles from './menu.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  icon: React$Element<any>,
  onPress: () => any,
  style?: ViewStyleProp,
  testId?: string,
}


export const MenuItem = (props: Props) => {
  const {icon, onPress, style, testId} = props;
  return (
    <View
      style={[styles.menuItem, style]}
    >
      <TouchableOpacity
        testID={testId}
        hitSlop={HIT_SLOP}
        style={[styles.menuItemButton, style]}
        onPress={onPress}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
};
