/* @flow */

import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import React from 'react';
import {COLOR_PINK, UNIT} from '../../components/variables/variables';

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
        style={[styles.menuItemButton, style]}
        onPress={onPress}
      >
        {icon}
        {isActive && <Text style={styles.menuItemLabel}>{label}</Text>}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  menuItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemButton: {
    minWidth: UNIT * 5,
    minHeight: UNIT * 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemLabel: {
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: COLOR_PINK
  }
});
