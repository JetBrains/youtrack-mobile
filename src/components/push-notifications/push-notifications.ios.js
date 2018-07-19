/* @flow */
import {PushNotificationIOS} from 'react-native';

import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import log from '../log/log';
import type Api from '../api/api';

const {KONNECTOR_URL} = appPackage.config;

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
      if ([400, 404, 405].includes(err?.status)) {
        log.debug('YouTrack server does not support push', err);
        return reject(new Error('YouTrack does not support push notifications'));
      }
      throw err;
    }

    /**
     * Then we register for push notifications with this token
     */
    PushNotificationIOS.addEventListener('register', async deviceToken => {
      try {
        const url = `${KONNECTOR_URL}/ring/pushNotifications`;
        await api.makeAuthorizedRequest(url, 'POST', {token: ytToken, appleDeviceId: deviceToken});
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    PushNotificationIOS.addEventListener('registrationError', async e => {
      log.info('PUSH: registration error', e);
      reject(e);
    });

    PushNotificationIOS.requestPermissions();
  });
}
