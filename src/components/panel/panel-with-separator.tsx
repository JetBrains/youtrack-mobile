import React from 'react';
import {View} from 'react-native';

import styles from './panel.styles';

import type {ViewStyleProp} from 'types/Internal';

export const PanelWithSeparator = (props: {children: any; style?: ViewStyleProp}) => {
  return (
    <>
      <View style={[styles.panelWithSeparator, props.style]}>{props.children}</View>
      <View style={styles.separator} />
    </>
  );
};
