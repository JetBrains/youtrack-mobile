/* @flow */

import React, {memo, useContext, useState} from 'react';

import {Calendar} from 'react-native-calendars';

import {ThemeContext} from '../theme/theme-context';
import {useSelector} from 'react-redux';

import styles, {calendarTheme} from './date-picker.styles';

import type {AppState} from '../../reducers';
import type {Theme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  current?: number,
  onDateSelect: (date: Date) => any,
  style?: ViewStyleProp,
};


const DatePicker = (props: Props) => {
  const [date, updateDate] = useState(props.current || new Date());
  const theme: Theme = useContext(ThemeContext);
  const firstDay: number = useSelector((state: AppState) => {
    const firstDayOfWeek: ?number = state?.app?.user?.profiles?.appearance?.firstDayOfWeek;
    return typeof firstDayOfWeek === 'number' ? firstDayOfWeek : 1;
  });

  return (
    <Calendar
      style={[styles.container, props.style]}
      current={date}
      selected={[date]}
      onDayPress={(day) => {
        updateDate();
        const newDate: Date = new Date(day.timestamp);
        props.onDateSelect(newDate);
      }}
      firstDay={firstDay}
      theme={calendarTheme(theme.uiTheme)}
    />
  );
};

export default (memo<Props>(DatePicker): React$AbstractComponent<Props, mixed>);
