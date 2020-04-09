/* @flow */

import {Notifications, RegistrationError} from 'react-native-notifications-latest';

import log from '../log/log';
import Router from '../router/router';

import PushNotificationsProcessor from './push-notifications-processor';
import {receiveDeviceToken} from './push-notifications.android__get-token';

import type Api from '../api/api';

const componentLogPrefix: string = 'PushNotificationsAndroid';

const deviceTokenPromise: Promise<string | RegistrationError> = receiveDeviceToken(componentLogPrefix);
let deviceToken: ?string = null;


async function register(api: Api) {
  deviceToken = await deviceTokenPromise;
  await PushNotificationsProcessor.subscribe(api, deviceToken);
}

async function unregister(api: Api) {
  await PushNotificationsProcessor.unsubscribe(api, deviceToken);
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
