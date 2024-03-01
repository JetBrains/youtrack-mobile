import React from 'react';
import {View} from 'react-native';

import {SvgFromXml} from 'react-native-svg';

import styles from './navigation.styles';

export default function NavigationIcon({xml, size, color}: {xml: string; size: number; color: string}) {
  return (
    <View style={styles.navIcon}>
      <SvgFromXml xml={xml} width={size} height={size} color={color} />
    </View>
  );
}
