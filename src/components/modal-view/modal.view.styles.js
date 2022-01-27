import {StyleSheet} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {boxShadow} from '../common-styles/shadow';

const borderRadius = 22;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMask: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '$dimBackground',
  },
  modal: {
    width: 704,
    maxHeight: '85%',
    backgroundColor: '$background',
    borderRadius,
    ...boxShadow,
  },
  modalFullscreen: {
    ...StyleSheet.absoluteFillObject,
    marginVertical: 0,
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    zIndex: 1,
    borderRadius: 0,
    backgroundColor: '$dimBackground',
  },
  modalContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius,
  },
  modalContentFullscreen: {
    borderRadius: 0,
  },
});
