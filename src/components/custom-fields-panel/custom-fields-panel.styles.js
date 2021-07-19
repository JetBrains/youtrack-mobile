import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../common-styles/shadow';
import {rowFormStyles} from '../common-styles/form';
import {UNIT} from '../variables/variables';

import type {UITheme, UIThemeColors} from '../../flow/Theme';


export default EStyleSheet.create({
  customFieldDateEditor: {
    flex: 1,
    padding: UNIT * 2,
  },
  customFieldEditorHeader: {
    ...elevation1,
  },
  customFieldSimpleEditor: {
    flex: 1,
    padding: UNIT * 2,
  },
  editorViewContainer: {
    flex: 1,
    flexShrink: 1,
  },
  customFieldDateEditorValue: {
    marginBottom: UNIT * 2,
  },
  customFieldDateEditorCalendar: {
    marginTop: UNIT * 2,
  },
  clearDate: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    color: '$link',
  },
  simpleValueInput: {
    ...rowFormStyles.input,
    backgroundColor: '$boxBackground',
    color: '$text',
  },
  savingFieldIndicator: {
    backgroundColor: '$linkLight',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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
    monthTextColor: uiThemeColors.$text,
  };
};
