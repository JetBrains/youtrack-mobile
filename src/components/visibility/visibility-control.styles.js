/* @flow */

import {StyleSheet} from 'react-native';
import {UNIT} from '../variables/variables';
import {secondaryText} from '../common-styles/typography';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resetButton: {
    marginRight: UNIT * 2
  },
  buttonIcon: {
    marginRight: UNIT
  },
  buttonText: {
    ...secondaryText
  }
});
