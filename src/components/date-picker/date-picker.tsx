import React, {memo, useContext, useState} from 'react';

import {Calendar} from 'react-native-calendars';
import {useSelector} from 'react-redux';

import {getFormattedDate} from 'components/date/date';
import {ThemeContext} from 'components/theme/theme-context';

import styles, {calendarTheme} from './date-picker.styles';

import type {AppState} from 'reducers';
import type {DateData} from 'react-native-calendars';
import type {Theme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

const DatePicker = (props: {date: Date | null; onDateSelect: (timestamp: number) => any; style?: ViewStyleProp}) => {
  const theme: Theme = useContext(ThemeContext);
  const firstDay: number = useSelector((state: AppState) => {
    const firstDayOfWeek = state?.app?.user?.profiles?.appearance?.firstDayOfWeek;
    return typeof firstDayOfWeek === 'number' ? firstDayOfWeek : 1;
  });

  const [selected, setSelected] = useState<string>('');

  React.useEffect(() => {
    if (props.date) {
      setSelected(getFormattedDate(props.date, 'yyyy-MM-dd'));
    }
  }, [props.date]);

  return (
    <Calendar
      initialDate={selected}
      style={[styles.container, props.style]}
      markedDates={{[selected]: {selected: true, marked: true}}}
      onDayPress={({timestamp, dateString}: DateData) => {
        setSelected(dateString);
        props.onDateSelect(timestamp);
      }}
      firstDay={firstDay}
      theme={calendarTheme(theme.uiTheme)}
    />
  );
};

export default memo(DatePicker);
