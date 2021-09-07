/* @flow */

import type {Node} from 'React';
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


export const MenuItem = (props: Props): Node => {
  const {icon, onPress, style, testID} = props;
  return (
    <View
      style={[styles.menuItem, style]}
    >
      <TouchableOpacity
        testID={testID}
        accessible={true}
        hitSlop={HIT_SLOP}
        style={[styles.menuItemButton, style]}
        onPress={onPress}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
};
