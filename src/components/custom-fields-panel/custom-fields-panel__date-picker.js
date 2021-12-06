/* @flow */


import React, {useEffect, useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Calendar} from 'react-native-calendars';

import Header from '../header/header';
import {IconClose} from '../icon/icon';

import styles from './custom-fields-panel.styles';

type Props = {
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


const DatePicker = (props: Props) => {
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
        leftButton={<IconClose size={21} color={styles.link.color}/>}
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
              {props.emptyValueName} (Clear value)
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
          firstDay={1}
          theme={props.theme}
        />
      </View>
    </>
  );
};

export default (React.memo<Props>(DatePicker): React$AbstractComponent<Props, mixed>);
