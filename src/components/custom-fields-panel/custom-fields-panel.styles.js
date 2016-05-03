import {StyleSheet} from 'react-native';
import {UNIT, FOOTER_HEIGHT, COLOR_PINK, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  customFieldsPanel: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: FOOTER_HEIGHT
  },
  editorViewContainer: {
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
  },
  periodInput: {
    flex: 1,
    height: UNIT * 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR_PINK,
    margin: UNIT,
    paddingLeft: UNIT,
    color: COLOR_FONT
  }
});
