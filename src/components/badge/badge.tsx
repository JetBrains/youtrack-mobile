import {Text} from 'react-native';
import React from 'react';
import styles from './badge.styles';
import type {ViewStyleProp} from 'flow/Internal';
type Props = {
  text: string;
  valid?: boolean;
  style?: ViewStyleProp;
};

const Badge = (props: Props) => (
  <Text style={[styles.badge, props.valid && styles.badgeValid, props.style]}>
    {props.text}
  </Text>
);

export default React.memo<Props>(Badge) as React$AbstractComponent<
  Props,
  unknown
>;
