/* @flow */

import {TouchableOpacity, View, Text, Image} from 'react-native';
import React, {PureComponent} from 'react';

import {next} from '../icon/icon';

import styles from './menu__item.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  label: string,
  description?: string,
  onPress: () => any,
  testId?: string,
  style?: ViewStyleProp
}

export default class MenuItem extends PureComponent<Props, void> {

  render() {
    const {onPress, style = null, testId = null, label, description = ''} = this.props;

    return (
      <TouchableOpacity
        testID={testId}
        style={[styles.menuItem, style]}
        activeOpacity={0.4}
        onPress={onPress}
      >
        <View style={styles.menuItemTopLine}>
          <Text style={styles.menuItemText}>{label}</Text>
          <Image style={styles.menuItemIcon} source={next}/>
        </View>
        <Text style={styles.menuItemSubtext}>{description}</Text>
      </TouchableOpacity>
    );
  }
}
