/* @flow */

import type {Node} from 'react';
import React from 'react';
import {View} from 'react-native';

import styles from './panel.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export const PanelWithSeparator = (props: { children: any, style?: ViewStyleProp }): Node => {
  return (
    <>
      <View style={[styles.panelWithSeparator, props.style]}>
        {props.children}
      </View>
      <View style={styles.separator}/>
    </>
  );
};
