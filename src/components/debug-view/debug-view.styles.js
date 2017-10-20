import {StyleSheet} from 'react-native';
import {UNIT, COLOR_TRANSPARENT_BLACK, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_TRANSPARENT_BLACK
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
