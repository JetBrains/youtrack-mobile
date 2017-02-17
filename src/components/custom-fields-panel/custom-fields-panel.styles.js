import {StyleSheet} from 'react-native';
import {UNIT, FOOTER_HEIGHT, COLOR_PINK, COLOR_FONT, COLOR_TRANSPARENT_BLACK, COLOR_BLACK, COLOR_DARK_BORDER} from '../../components/variables/variables';

const SAVING_ALPHA = '70';

export default StyleSheet.create({
  customFieldsPanel: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: COLOR_BLACK,
    height: FOOTER_HEIGHT,
    borderTopWidth: 1,
    borderColor: COLOR_DARK_BORDER
  },
  editorViewContainer: {
    backgroundColor: COLOR_TRANSPARENT_BLACK,
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
  simpleValueInput: {
    height: UNIT * 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR_PINK,
    margin: UNIT,
    paddingLeft: UNIT,
    color: COLOR_FONT
  },
  savingFieldIndicator: {
    backgroundColor: `#CCCCCC${SAVING_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
