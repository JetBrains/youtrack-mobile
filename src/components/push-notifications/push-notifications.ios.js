/* @flow */

import NotificationsIOS from 'react-native-notifications';
import Router from '../router/router';
import log from '../log/log';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

import type Api from '../api/api';

const {KONNECTOR_URL} = appPackage.config;

let appleDeviceToken = null;

NotificationsIOS.addEventListener('remoteNotificationsRegistered', deviceToken => {
  log.info(`Apple device token received: "${deviceToken}"`);
  appleDeviceToken = deviceToken;
});

NotificationsIOS.addEventListener('notificationReceivedBackground', notification => {
  log.info('PUSH:notification received in background', notification);
});
NotificationsIOS.addEventListener('notificationReceivedForeground', notification => {
  log.info('PUSH:notification received in foreground', notification);
});

NotificationsIOS.addEventListener('notificationOpened', notification => {
  const {ytIssueId, ytUserId} = notification.getData();
  log.info(`PUSH:notification opened for issue "${ytIssueId}" for user "${ytUserId}"`);
  if (!ytIssueId) {
    return;
  }

  Router.SingleIssue({issueId: ytIssueId});
});

function register(api: Api): Promise<void> {
  // eslint-disable-next-line no-async-promise-executor
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
    async function onRegister(deviceToken): Promise<void> {
      NotificationsIOS.removeEventListener('remoteNotificationsRegistered', onRegister);
      try {
        const url = `${KONNECTOR_URL}/ring/pushNotifications`;
        await api.makeAuthorizedRequest(url, 'POST', {token: ytToken, appleDeviceId: deviceToken});
        resolve();
      } catch (err) {
        reject(err);
      }
    }
    NotificationsIOS.addEventListener('remoteNotificationsRegistered', onRegister);

    async function onRegistrationError(e) {
      NotificationsIOS.removeEventListener('remoteNotificationsRegistrationFailed', onRegistrationError);
      log.info('PUSH: registration error', e);
      reject(e);
    }
    NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', onRegistrationError);

    // $FlowFixMe: error in type annotations of library
    NotificationsIOS.requestPermissions();
  });
}

async function unregister(api: Api): Promise<void> {
  log.info('Unsubscribing from push notifications...');
  const url = `${KONNECTOR_URL}/ring/pushNotifications/unsubscribe`;
  await api.makeAuthorizedRequest(url, 'POST', {appleDeviceId: appleDeviceToken});
  log.info('Successfully unsubscribed from push notifications');
}

function initialize(api: Api) {
  // $FlowFixMe: error in type annotations of library
  NotificationsIOS.requestPermissions();
  NotificationsIOS.consumeBackgroundQueue();
  log.info('push-notifications.ios(initialize): initialized');
}

export default {
  register,
  unregister,
  initialize,
};
