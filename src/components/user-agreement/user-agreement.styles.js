import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  markdownScroll: {
    paddingTop: 0,
    padding: UNIT * 2
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
