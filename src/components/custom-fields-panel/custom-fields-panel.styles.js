import {StyleSheet} from 'react-native';
import {
  UNIT,
  FOOTER_HEIGHT,
  COLOR_PINK,
  COLOR_SELECTED_DARK,
  COLOR_GRAY,
  COLOR_TRANSPARENT_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK
} from '../../components/variables/variables';

const SAVING_ALPHA = '70';
const DONE_BUTTON_HEIGHT = 24;

export default StyleSheet.create({
  placeholder: {
    height: FOOTER_HEIGHT,
    backgroundColor: COLOR_BLACK
  },
  customFieldsEditor: {
    top: UNIT * 2,
    borderWidth: 0
  },
  topBorder: {
    height: 1,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2,
    backgroundColor: '#475159'
  },
  customFieldsPanel: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: COLOR_BLACK,
    height: FOOTER_HEIGHT
  },
  customFieldsPanelModal: {
    borderTopWidth: 0
  },
  editorViewContainer: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  calendar: {
    padding: UNIT*2,
    paddingBottom: UNIT
  },
  clearDate: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    color: COLOR_PINK
  },
  simpleValueInput: {
    paddingTop: 2,
    paddingBottom: 2,

    height: UNIT * 4,
    margin: UNIT,
    paddingLeft: UNIT,
    backgroundColor: COLOR_SELECTED_DARK,
    color: COLOR_FONT_ON_BLACK
  },
  savingFieldIndicator: {
    backgroundColor: `#CCCCCC${SAVING_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  doneButton: {
    marginBottom: UNIT * 2,
    backgroundColor: COLOR_PINK,
    padding: UNIT
  },
  doneButtonText: {
    height: DONE_BUTTON_HEIGHT,
    fontSize: 20,
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'center'
  }
});

export const calendarTheme = {
  calendarBackground: COLOR_BLACK,
  textSectionTitleColor: COLOR_GRAY,
  selectedDayBackgroundColor: COLOR_PINK,
  selectedDayTextColor: COLOR_FONT_ON_BLACK,
  todayTextColor: COLOR_PINK,
  dayTextColor: COLOR_FONT_ON_BLACK,
  textDisabledColor: COLOR_FONT_GRAY,
  dotColor: COLOR_FONT_ON_BLACK,
  selectedDotColor: COLOR_FONT_ON_BLACK,
  arrowColor: COLOR_PINK,
  monthTextColor: COLOR_FONT_ON_BLACK
};
