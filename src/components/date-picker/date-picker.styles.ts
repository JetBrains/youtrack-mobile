import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';

import type {UITheme, UIThemeColors} from 'types/Theme';
import {Theme as CalendarTheme} from 'react-native-calendars/src/types';
import {rowFormStyles} from 'components/common-styles/form';

const simpleValueInput = {...rowFormStyles.input, color: '$text'};

export default EStyleSheet.create({
  container: {
    flex: 1,
    minHeight: UNIT * 42,
  },
  link: {
    color: '$link',
  },
  placeholderText: {
    color: '$icon',
  },
  icon: {
    color: '$icon',
  },
  customFieldDateEditor: {
    flex: 1,
    padding: UNIT * 2,
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
  simpleValueInput,
});

export const calendarTheme = (uiTheme: UITheme): CalendarTheme => {
  const uiThemeColors: UIThemeColors = uiTheme.colors;
  return {
    arrowColor: uiThemeColors.$link,
    calendarBackground: uiThemeColors.$background,
    dayTextColor: uiThemeColors.$text,
    dotColor: uiThemeColors.$text,
    monthTextColor: uiThemeColors.$text,
    selectedDayBackgroundColor: uiThemeColors.$link,
    selectedDayTextColor: uiThemeColors.$background,
    selectedDotColor: uiThemeColors.$text,
    textDisabledColor: uiThemeColors.$disabled,
    textSectionTitleColor: uiThemeColors.$icon,
    textMonthFontWeight: '400',
    textMonthFontSize: MAIN_FONT_SIZE,
    textDayHeaderFontWeight: '400',
    textDayFontSize: MAIN_FONT_SIZE,
    textDayFontWeight: '400',
    todayTextColor: uiThemeColors.$link,
  };
};
