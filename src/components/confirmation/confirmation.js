/* @flow */

import {Alert} from 'react-native';

export const confirmation = async (title: string, actionButtonTitle: string, message?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      title,
      message,
      [
        {text: 'Cancel', style: 'cancel', onPress: reject},
        {text: actionButtonTitle, onPress: resolve},
      ],
      {cancelable: true}
    );
  });
};
