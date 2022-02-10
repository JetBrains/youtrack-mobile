/* @flow */

import React, {memo, useContext, useState} from 'react';
import {View} from 'react-native';

import {Calendar} from 'react-native-calendars';

import {ThemeContext} from '../theme/theme-context';

import styles, {calendarTheme} from './date-picker.styles';

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

  return (
    <View
      style={[styles.container, props.style]}
    >
      <Calendar
        current={date}
        selected={[date]}
        onDayPress={(day) => {
          updateDate();
          const newDate: Date = new Date(day.timestamp);
          props.onDateSelect(newDate);
        }}
        firstDay={1}
        theme={calendarTheme(theme.uiTheme)}
      />
    </View>
  );
};

export default (memo<Props>(DatePicker): React$AbstractComponent<Props, mixed>);
