import {Alert} from 'react-native';

import {i18n} from 'components/i18n/i18n';

export const deleteButtonText: string = i18n('Delete');


export const confirmation = async (
  title: string,
  actionButtonTitle: string,
  message?: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: i18n('Cancel'),
          style: 'cancel',
          onPress: reject,
        },
        {
          text: actionButtonTitle,
          onPress: resolve,
        },
      ],
      {
        cancelable: true,
      },
    );
  });
};
