import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';

import type {UITheme, UIThemeColors} from 'types/Theme';
import {Theme as CalendarTheme} from 'react-native-calendars/src/types';

export default EStyleSheet.create({
  container: {
    flex: 1,
    minHeight: UNIT * 42,
  },
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
