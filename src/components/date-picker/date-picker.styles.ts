import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import type {UITheme, UIThemeColors} from 'flow/Theme';
import {MAIN_FONT_SIZE} from '../common-styles/typography';
export default EStyleSheet.create({
  container: {
    flex: 1,
    minHeight: UNIT * 42,
  },
});
export const calendarTheme = (uiTheme: UITheme) => {
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