/* @flow */

import React from 'react';
import {View} from 'react-native';

import styles from './panel.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export const PanelWithSeparator = (props: { children: any, styles?: ViewStyleProp }) => {
  return (
    <>
      <View style={[styles.panelWithSeparator, props.styles]}>
        {props.children}
      </View>
      <View style={styles.separator}/>
    </>
  );
};
