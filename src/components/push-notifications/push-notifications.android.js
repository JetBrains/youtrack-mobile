/* @flow */

import {Notifications, RegistrationError} from 'react-native-notifications-latest';

import log from '../log/log';
import Router from '../router/router';

import PushNotificationsProcessor from './push-notifications-processor';
import {receiveDeviceToken} from './push-notifications.android__get-token';

import type Api from '../api/api';

const componentLogPrefix: string = 'PushNotificationsAndroid';
let deviceToken: ?string = null;

const deviceTokenPromise: Promise<string | RegistrationError> = receiveDeviceToken(componentLogPrefix);
deviceTokenPromise.then(
  (token: string) => {
    deviceToken = token;
    log.info(`${componentLogPrefix}(deviceTokenPromise): set device token: ${deviceToken}`);
  }
);


async function register(api: Api) {
  return deviceTokenPromise.then(async () => {
    return await PushNotificationsProcessor.subscribe(api, deviceToken);
  }).catch((error: Error) => {
    throw error;
  });
}

async function unregister(api: Api) {
  return await PushNotificationsProcessor.unsubscribe(api, deviceToken);
}

function initialize() {
  const logMsgPrefix: string = `${componentLogPrefix}(initialize): `;
  const onNotification = (issueId) => Router.SingleIssue({issueId});

  PushNotificationsProcessor.registerNotificationEvents(onNotification);

  Notifications.getInitialNotification()
    .then((notification) => {
      log.info(logMsgPrefix, (notification ? JSON.stringify(notification.payload) : 'N/A'));
      if (notification?.payload?.issueId) {
        log.info(
          `${logMsgPrefix}redirecting to the issue ${notification.payload.issueId}`,
          JSON.stringify(notification.payload)
        );
        onNotification(notification.payload.issueId);
      }
      log.info(`${logMsgPrefix}initialized`);
    })
    .catch((err) => log.warn(`${logMsgPrefix}failed`, err));
}

export default {
  register,
  unregister,
  initialize
};
