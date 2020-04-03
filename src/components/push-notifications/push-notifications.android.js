/* @flow */

import log from '../log/log';
import Router from '../router/router';

import {Notifications, RegistrationError} from 'react-native-notifications-latest';
import PushNotificationsProcessor from './push-notifications-processor';
import {receiveDeviceToken} from './push-notifications.android__get-token';

import type Api from '../api/api';

const componentPrefix: string = 'PushNotificationAndroid';
const deviceTokenPromise: Promise<string | RegistrationError> = receiveDeviceToken();
let deviceToken: ?string = null;


async function register(api: Api) {
  deviceToken = await deviceTokenPromise;
  await PushNotificationsProcessor.subscribe(api, deviceToken);
}

async function unregister(api: Api) {
  await PushNotificationsProcessor.unsubscribe(api, deviceToken);
}

function initialize() {
  const prefixLogMsg: string = `${componentPrefix}(initialize): `;
  const onNotification = (issueId) => Router.SingleIssue({issueId});

  PushNotificationsProcessor.registerNotificationEvents(onNotification);

  Notifications.getInitialNotification()
    .then((notification) => {
      log.info(prefixLogMsg, (notification ? JSON.stringify(notification.payload) : 'N/A'));
      if (notification?.payload?.issueId) {
        log.info(
          `${prefixLogMsg}redirecting to the issue ${notification.payload.issueId}`,
          JSON.stringify(notification.payload)
        );
        onNotification(notification.payload.issueId);
      }
      log.info(`${prefixLogMsg}initialized`);
    })
    .catch((err) => log.warn(`${prefixLogMsg}failed`, err));
}

export default {
  register,
  unregister,
  initialize
};
