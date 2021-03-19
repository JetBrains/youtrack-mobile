/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },

  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: '$link',
  },

  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3,
  },

  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },

  removeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    opacity: 0.4,
  },
});
