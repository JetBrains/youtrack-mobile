/* @flow */
import {PushNotificationIOS} from 'react-native';

import log from '../log/log';
import type Api from '../api/api';

PushNotificationIOS.addEventListener('notification', e => log.info('PUSH:notification', e));

export function registerForPush(api: Api) {
  return new Promise(async (resolve, reject) => {
    /**
     * First we ask YT for token and exit if YT does not support PUSH notifications
     */
    let ytToken: string;
    try {
      log.debug(`Getting YT notifications token...`);
      ytToken = await api.getNotificationsToken();
      log.debug(`YT notifications token received: "${ytToken}"`);
    } catch (err) {
      if (err.status === 405 || err.status === 400) {
        log.debug('YouTrack server does not support push', err);
        return reject(new Error('YouTrack does not support push notifications'));
      }
      throw err;
    }

    /**
     * Then we register for push notifications with this token
     */
    PushNotificationIOS.addEventListener('register', deviceToken => {
      try {
        api.registerNotificationToken(ytToken, deviceToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    PushNotificationIOS.addEventListener('registrationError', e => {
      log.info('PUSH: registration error', e);
      reject(e);
    });

    PushNotificationIOS.requestPermissions();
  });
}
