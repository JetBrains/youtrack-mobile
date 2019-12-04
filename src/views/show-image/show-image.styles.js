/* @flow */

import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1
  },

  gallery: {
    flex: 1,
    backgroundColor: 'black'
  },

  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  closeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3
  },

  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    right: UNIT * 3
  },

  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },

  removeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    opacity: 0.4
  }
});
