/* @flow */

import log from '../log/log';
import {notify} from '../notification/notification';

import {RegistrationError} from 'react-native-notifications-latest';

import PushNotificationsProcessor from './push-notifications-processor';


export const receiveDeviceToken = (componentLogPrefix: string = 'Android'): Promise<string | Error> => {
  const logPrefix = `${componentLogPrefix}(receiveDeviceToken): `;

  return new Promise((resolve: (token: string) => any, reject: (error:RegistrationError) => any) => {
    PushNotificationsProcessor.subscribeOnRegistrationEvent((token: string) => {
      log.info(`${logPrefix}Device token received`);
      resolve(token);
    }, (error: RegistrationError) => {
      const errorMsg = 'Cannot get a device token.';
      log.warn(`${logPrefix}${errorMsg}`, error);
      notify(`${errorMsg} Try restart the application`);
      reject(error);
    });
  });
};
