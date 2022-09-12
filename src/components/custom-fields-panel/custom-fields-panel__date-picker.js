/* @flow */


import React, {useEffect, useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Calendar} from 'react-native-calendars';
import {useSelector} from 'react-redux';

import Header from '../header/header';
import {i18n} from 'components/i18n/i18n';
import {IconClose, IconBack} from '../icon/icon';

import styles from './custom-fields-panel.styles';

import type {AppState} from '../../reducers';

type Props = {
  modal?: boolean,
  emptyValueName?: ?string,
  onApply: (date, time) => any,
  onHide: () => void,
  placeholder: string,
  theme: any,
  title: string,
  time?: ?string,
  value: string | null,
  withTime: boolean,
}


const DatePickerField = (props: Props) => {
  const firstDay: number = useSelector((state: AppState) => {
    const firstDayOfWeek: ?number = state?.app?.user?.profiles?.appearance?.firstDayOfWeek;
    return typeof firstDayOfWeek === 'number' ? firstDayOfWeek : 1;
  });
  const [value, updateValue] = useState('');
  const [time, updateTime] = useState('');

  useEffect(() => {
    updateTime(props.time);
    updateValue(props.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApply = (date: Date = value) => props.onApply(date, time);

  return (
    <>
      <Header
        style={styles.customFieldEditorHeader}
        leftButton={props.modal ? <IconBack color={styles.link.color}/> : <IconClose size={21} color={styles.link.color}/>}
        onBack={props.onHide}
        title={props.title}
      />
      <View style={styles.customFieldDateEditor}>

        <View style={styles.customFieldDateEditorValue}>
          {!!props.emptyValueName &&
          <TouchableOpacity
            style={styles.buttonClearDate}
            onPress={() => props.onApply(null)}
          >
            <Text style={styles.buttonClearDateText}>
              {props.emptyValueName} {i18n('(Clear value)')}
            </Text>
          </TouchableOpacity>}
        </View>

        {props.withTime && (
          <TextInput
            placeholderTextColor={styles.placeholderText.color}
            style={styles.simpleValueInput}
            placeholder={props.placeholder}
            underlineColorAndroid="transparent"
            clearButtonMode="always"
            autoCorrect={false}
            autoCapitalize="none"
            value={time}
            onSubmitEditing={() => {
              onApply();
            }}
            onChangeText={(updatedTime: string) => {
              updateTime(updatedTime);
            }}
          />
        )}

        <Calendar
          style={styles.customFieldDateEditorCalendar}
          current={props.value}
          selected={[value]}
          onDayPress={(day) => {
            onApply(new Date(day.timestamp), time);
          }}
          firstDay={firstDay}
          theme={props.theme}
        />
      </View>
    </>
  );
};

export default (React.memo<Props>(DatePickerField): React$AbstractComponent<Props, mixed>);
