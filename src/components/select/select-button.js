/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import styles from './select-button.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {IconAngleRight} from '../icon/icon';

type Props = {
  children: any,
  subTitle?: string,
  onPress: () => any,
  style?: ViewStyleProp
};


const SelectButton = (props: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, props.style]}
      onPress={props.onPress}
    >
      {!!props.subTitle && <Text style={styles.buttonTextSub}>{props.subTitle}</Text>}
      <Text style={[styles.buttonText, props.subTitle ? styles.buttonTextMain : null]}>
        {props.children}
      </Text>
      <IconAngleRight size={20} color={styles.buttonIcon.color}/>
    </TouchableOpacity>
  );
};


export default (React.memo<Props>(SelectButton): React$AbstractComponent<Props, mixed>);
