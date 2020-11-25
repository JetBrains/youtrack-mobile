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
  testID?: string,
}


export const MenuItem = (props: Props) => {
  const {icon, isActive = false, onPress, style, testID, label} = props;

  return (
    <View
      testID={testID}
      style={[styles.menuItem, style]}
    >
      <TouchableOpacity
        testID={testID ? `${testID}Button` : null}
        hitSlop={HIT_SLOP}
        style={[styles.menuItemButton, style]}
        onPress={onPress}
      >
        {icon}
        {isActive && <Text style={styles.menuItemLabel} numberOfLines={1}>{label}</Text>}
      </TouchableOpacity>
    </View>
  );
};
