import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {formStyles} from '../common-styles/form';
import {separator} from '../common-styles/list';

import type {UITheme, UIThemeColors} from '../../flow/Theme';

const HEIGHT = UNIT * 12;

export default EStyleSheet.create({
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
    ...separator,
    borderColor: '$separator'
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
    color: '$link'
  },
  simpleValueInput: {
    ...formStyles.input,
    backgroundColor: '$boxBackground',
    color: '$text',
  },
  savingFieldIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export const calendarTheme = (uiTheme: UITheme) => {
  const uiThemeColors:UIThemeColors = uiTheme.colors;
  return {
    calendarBackground: uiThemeColors.$background,
    textSectionTitleColor: uiThemeColors.$icon,
    selectedDayBackgroundColor: uiThemeColors.$link,
    selectedDayTextColor: uiThemeColors.$background,
    todayTextColor: uiThemeColors.$link,
    dayTextColor: uiThemeColors.$text,
    textDisabledColor: uiThemeColors.$disabled,
    dotColor: uiThemeColors.$text,
    selectedDotColor: uiThemeColors.$text,
    arrowColor: uiThemeColors.$link,
    monthTextColor: uiThemeColors.$text
  };
};
