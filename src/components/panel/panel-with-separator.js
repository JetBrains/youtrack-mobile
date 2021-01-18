/* @flow */

import React from 'react';
import {View} from 'react-native';

import styles from './panel.styles';


export const PanelWithSeparator = (props: { children: any }) => {
  return (
    <>
      <View style={styles.panelWithSeparator}>
        {props.children}
      </View>
      <View style={styles.separator}/>
    </>
  );
};
