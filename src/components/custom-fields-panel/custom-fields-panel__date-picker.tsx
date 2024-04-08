import React, {useEffect, useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

import DatePicker from 'components/date-picker/date-picker';
import Header from 'components/header/header';
import {i18n} from 'components/i18n/i18n';
import {IconClose, IconBack} from 'components/icon/icon';

import styles from './custom-fields-panel.styles';

interface Props {
  modal?: boolean;
  emptyValueName?: string | null | undefined;
  onApply: (date: Date, time: string) => any;
  onHide: () => void;
  placeholder: string;
  theme: any;
  title: string;
  time?: string | null | undefined;
  date: Date;
  withTime: boolean;
}

const DatePickerField = (props: Props) => {
  const [value, updateValue] = useState(props.date);
  const [time, updateTime] = useState('');

  useEffect(() => {
    updateTime(props.time);
    updateValue(props.date);
  }, [props.date, props.time]);

  const onApply = (date: Date = value) => props.onApply(date, time);

  return (
    <>
      <Header
        style={styles.customFieldEditorHeader}
        leftButton={
          props.modal ? (
            <IconBack color={styles.link.color} />
          ) : (
            <IconClose color={styles.link.color} />
          )
        }
        onBack={props.onHide}
        title={props.title}
      />
      <View style={styles.customFieldDateEditor}>
        <View style={styles.customFieldDateEditorValue}>
          {!!props.emptyValueName && (
            <TouchableOpacity
              style={styles.buttonClearDate}
              onPress={() => props.onApply(null)}
            >
              <Text style={styles.buttonClearDateText}>
                {props.emptyValueName} {i18n('(Clear value)')}
              </Text>
            </TouchableOpacity>
          )}
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

        <DatePicker
          style={styles.customFieldDateEditorCalendar}
          date={value}
          onDateSelect={(timestamp: number) => {
            onApply(new Date(timestamp));
          }}
        />
      </View>
    </>
  );
};

export default React.memo(DatePickerField);
