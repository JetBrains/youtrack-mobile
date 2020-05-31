import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_PINK,
  COLOR_GRAY,
  COLOR_FONT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_MEDIUM_GRAY
} from '../variables/variables';
import {formStyles} from '../common-styles/form';

const HEIGHT = UNIT * 12;
const SAVING_ALPHA = '70';

export default StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    height: HEIGHT,
  },
  customFieldDateEditor: {
    flex: 1,
    padding: UNIT * 2
  },
  bottomBorder: {
    height: 0.5,
    marginLeft: UNIT * 2,
    backgroundColor: COLOR_MEDIUM_GRAY
  },
  customFieldsPanel: {
    flexDirection: 'row',
    height: HEIGHT,
    paddingLeft: UNIT,
  },
  customFieldEditorHeader: {
    paddingLeft: UNIT * 2
  },
  customFieldSimpleEditor: {
    flex: 1,
    padding: UNIT * 2
  },
  editorViewContainer: {
    flex: 1,
    flexShrink: 1
  },
  customFieldDateEditorValue: {
    marginBottom: UNIT * 2
  },
  customFieldDateEditorCalendar: {
    marginTop: UNIT * 2
  },
  clearDate: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    color: COLOR_PINK
  },
  simpleValueInput: {
    ...formStyles.input,
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

export const calendarTheme = {
  calendarBackground: COLOR_FONT_ON_BLACK,
  textSectionTitleColor: COLOR_GRAY,
  selectedDayBackgroundColor: COLOR_PINK,
  selectedDayTextColor: COLOR_FONT_ON_BLACK,
  todayTextColor: COLOR_PINK,
  dayTextColor: COLOR_BLACK,
  textDisabledColor: COLOR_FONT_GRAY,
  dotColor: COLOR_BLACK,
  selectedDotColor: COLOR_BLACK,
  arrowColor: COLOR_PINK,
  monthTextColor: COLOR_BLACK
};
