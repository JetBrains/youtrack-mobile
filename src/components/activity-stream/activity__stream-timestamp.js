/* @flow */

import React from 'react';
import {Text} from 'react-native';

import {ytDate} from 'components/date/date';

import styles from './activity__stream.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  timestamp?: number,
  style?: ViewStyleProp
}


const StreamTimestamp = (props: Props) => {
  if (typeof props.timestamp !== 'number') {
    return null;
  }
  return (
    <Text style={[styles.activityTimestamp, props.style]}>
      {ytDate(props.timestamp)}
    </Text>
  );

};

export default (React.memo<Props>(StreamTimestamp): React$AbstractComponent<Props, mixed>);
