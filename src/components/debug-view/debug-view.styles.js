import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK} from '../variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    padding: UNIT * 2,
    alignItems: 'center'
  },
  closeButtonText: {
    color: COLOR_PINK
  }
});
