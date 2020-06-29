import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';

import {COLOR_LIGHT_GRAY, COLOR_PINK, UNIT} from '../variables/variables';


export const LoadMoreList = function () {
  return <ActivityIndicator color={COLOR_PINK} style={styles.loadingIndicator}/>;
};


const styles = StyleSheet.create({
  loadingIndicator: {
    textAlign: 'center',
    padding: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_LIGHT_GRAY
  }
});
