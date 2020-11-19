/* @flow */

import React from 'react';
import {View} from 'react-native';

type Props = {
  children: any,
};

export default function (props: Props) {

  return (
    <View testID="page">
      {props.children}
    </View>
  );
}
