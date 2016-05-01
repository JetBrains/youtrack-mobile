import {StyleSheet} from 'react-native';
import {UNIT, FOOTER_HEIGHT, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  customFieldsPanel: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: FOOTER_HEIGHT
  },
  datepickerViewContainer: {
    backgroundColor: '#FFFFFFF0',
    position: 'absolute',
    left: 0,
    right: 0
  },
  calendar: {
    padding: UNIT*2
  },
  clearDate: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    color: COLOR_PINK
  }
});
