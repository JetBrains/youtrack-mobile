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
  testID?: string,
}


export const MenuItem = (props: Props) => {
  const {icon, onPress, style, testID} = props;

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
      </TouchableOpacity>
    </View>
  );
};
