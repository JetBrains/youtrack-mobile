import {StyleSheet} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {boxShadow, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'inherited',
  },
  containerPopup: {
    backgroundColor: 'transparent',
  },
  modalMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '$dimBackground',
  },
  fullscreen: {
    backgroundColor: '#1F2326',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    ...boxShadow,
  },
  modalContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    minWidth: '50%',
    minHeight: '50%',
    backgroundColor: '$background',
    borderRadius: UNIT * 2,
  },
  modalPopup: {
    width: null,
    height: null,
    minWidth: 50,
    minHeight: 50,
    maxWidth: '80%',
    borderRadius: UNIT * 2,
    padding: UNIT * 2.5,
  },
});
