import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../common-styles/shadow';
import {headerTitlePresentation} from '../header/header.styles';
import {rowFormStyles} from '../common-styles/form';
import {UNIT} from '../variables/variables';

import type {UITheme, UIThemeColors} from 'flow/Theme';


const simpleValueInput = {
  ...rowFormStyles.input,
  color: '$text',
};

export default EStyleSheet.create({
  customFieldDateEditor: {
    flex: 1,
    padding: UNIT * 2,
  },
  customFieldEditorHeader: {
    paddingHorizontal: UNIT * 2,
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
  buttonClearDate: {
    ...simpleValueInput,
    padding: UNIT * 2,
    backgroundColor: 'transparent',
    borderColor: '$separator',
    borderWidth: 1,
  },
  buttonClearDateText: {
    color: '$link',
    textAlign: 'center',
  },
  simpleValueInput: simpleValueInput,
  savingFieldIndicator: {
    backgroundColor: '$linkLight',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  savingFieldTitle: headerTitlePresentation,
  link: {
    color: '$link',
  },
  placeholderText: {
    color: '$icon',
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
