/* @flow */

import {Alert} from 'react-native';

import {until} from '../../util/util';

export const confirmation = async (title: string, actionButtonTitle: string, message?: string) => {
  await until(new Promise((resolve, reject) => {
    Alert.alert(
      title,
      message,
      [
        {text: 'Cancel', style: 'cancel', onPress: reject},
        {text: actionButtonTitle, onPress: resolve}
      ],
      {cancelable: true}
    );
  }));
};
