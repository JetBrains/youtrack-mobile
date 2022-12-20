import React from 'react';
import {ActivityIndicator} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {DEFAULT_THEME} from '../theme/theme';
import {UNIT} from '../variables/variables';
export const LoadMoreList = function () {
  return (
    <ActivityIndicator
      color={DEFAULT_THEME.colors.$link}
      style={styles.loadingIndicator}
    />
  );
};
const styles = EStyleSheet.create({
  loadingIndicator: {
    textAlign: 'center',
    padding: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground',
  },
});
