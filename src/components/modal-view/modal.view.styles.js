import {StyleSheet} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {boxShadow} from '../common-styles/shadow';
import {UNIT} from '../variables/variables';

const borderRadius = 22;

export default EStyleSheet.create({
  box: {
    flex: 1,
  },
  modalMask: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '$dimBackground',
  },
  modal: {
    width: 704,
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: UNIT * 7,
    backgroundColor: '$background',
    borderRadius,
    ...boxShadow,
  },
  modalContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    backgroundColor: '$background',
    borderRadius,
  },
});
