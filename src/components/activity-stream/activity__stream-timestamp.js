/* @flow */

import React from 'react';
import {Text} from 'react-native';

import {relativeDate} from '../issue-formatter/issue-formatter';

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
      {relativeDate(props.timestamp)}
    </Text>
  );

};

export default React.memo<Props>(StreamTimestamp);
