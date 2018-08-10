/* @flow */
import NotificationsIOS from 'react-native-notifications';

import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import Router from '../router/router';
import log from '../log/log';
import type Api from '../api/api';

const {KONNECTOR_URL} = appPackage.config;

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
    NotificationsIOS.addEventListener('remoteNotificationsRegistered', async deviceToken => {
      try {
        const url = `${KONNECTOR_URL}/ring/pushNotifications`;
        await api.makeAuthorizedRequest(url, 'POST', {token: ytToken, appleDeviceId: deviceToken});
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', async e => {
      log.info('PUSH: registration error', e);
      reject(e);
    });
    // $FlowFixMe: error in type annotations of library
    NotificationsIOS.requestPermissions();
  });
}


export function initializePushNotifications() {
  // $FlowFixMe: error in type annotations of library
  NotificationsIOS.requestPermissions();
  NotificationsIOS.consumeBackgroundQueue();
}
