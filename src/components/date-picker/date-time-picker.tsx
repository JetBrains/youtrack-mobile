import React, {useEffect, useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

import DatePicker from 'components/date-picker/date-picker';
import Header from 'components/header/header';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconClose, IconBack, IconCheck} from 'components/icon/icon';
import {toTimeString, toStartOfDayTimeString} from 'components/date/date';

import styles from './date-picker.styles';

interface Props {
  modal?: boolean;
  emptyValueName?: string | null;
  onApply: (date: Date | null) => any;
  onHide: () => void;
  placeholder?: string;
  title?: string;
  current: Date | null;
  withTime?: boolean;
}

const DateTimePicker = (props: Props) => {
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [time, setTime] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (props.current) {
      setDate(props.current);
    }
    if (props.withTime) {
      setTime(props.current ? toTimeString(props.current) : toStartOfDayTimeString(date));
    }
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const validateTime = (t: string = '') => {
    const str = t.trim();
    setDisabled(!str ? true : !/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(t));
  };

  const linkColor = styles.link.color;
  return (
    <>
      <Header
        showShadow
        leftButton={props.modal ? <IconBack color={linkColor} /> : <IconClose color={linkColor} />}
        extraButton={
          <TouchableOpacity
            disabled={disabled}
            hitSlop={HIT_SLOP}
            onPress={() => {
              const d = date;
              const match = time.match(/(\d\d):(\d\d)/);
              if (match) {
                const [, hh = 0, mm = 0] = match;
                d.setHours(parseInt(`${hh}`, 10), parseInt(`${mm}`, 10));
              }
              props.onApply(d);
            }}
          >
            <IconCheck color={disabled ? styles.icon.color : styles.link.color} />
          </TouchableOpacity>}
        onBack={props.onHide}
        title={props.title || i18n('Set a date')}
      />
      <View style={styles.customFieldDateEditor}>
        <View style={styles.customFieldDateEditorValue}>
          {!!props.emptyValueName && (
            <TouchableOpacity style={styles.buttonClearDate} onPress={() => props.onApply(null)}>
              <Text style={styles.buttonClearDateText}>
                {props.emptyValueName} {i18n('(Clear value)')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {props?.withTime && (
          <TextInput
            placeholderTextColor={styles.placeholderText.color}
            style={styles.simpleValueInput}
            placeholder={props.placeholder || i18n('Add time')}
            underlineColorAndroid="transparent"
            clearButtonMode="always"
            autoCorrect={false}
            autoCapitalize="none"
            value={time}
            onChangeText={(t: string) => {
              setTime(t);
              validateTime(t);
            }}
          />
        )}

        <DatePicker
          style={styles.customFieldDateEditorCalendar}
          date={props.current}
          onDateSelect={(timestamp: number) => {
            setDate(new Date(timestamp));
          }}
        />
      </View>
    </>
  );
};

export default React.memo(DateTimePicker);
