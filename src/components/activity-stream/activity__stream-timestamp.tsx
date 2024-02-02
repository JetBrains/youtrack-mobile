import React from 'react';
import {Text} from 'react-native';
import {absDate, ytDate} from 'components/date/date';
import styles from './activity__stream.styles';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  isAbs?: boolean;
  timestamp?: number;
  style?: ViewStyleProp;
}

const StreamTimestamp = (props: Props) => {
  if (typeof props.timestamp !== 'number') {
    return null;
  }

  return (
    <Text style={[styles.activityTimestamp, props.style]}>
      {props.isAbs ? absDate(props.timestamp) : ytDate(props.timestamp)}
    </Text>
  );
};

export default React.memo<Props>(StreamTimestamp);
