/* @flow */

import log from '../log/log';
import Router from '../router/router';

import {Notifications, Registered, RegistrationError} from 'react-native-notifications-latest';
import PushNotificationsProcessor from './push-notifications-processor';

import type Api from '../api/api';

let deviceToken: ?string = null;


subscribeOnRegistrationEvent((token: string) => {
  deviceToken = token;
});

function subscribeOnRegistrationEvent(onRegister: (deviceToken: string) => void) {
  if (deviceToken) {
    return onRegister(deviceToken);
  }

  const eventsRegistry = Notifications.events();
  eventsRegistry.registerRemoteNotificationsRegistered(
    (event: Registered) => {
      log.info('PushNotificationAndroid(registerRemoteNotificationsRegistered): Device token received', event.deviceToken);
      deviceToken = event.deviceToken;
      onRegister(deviceToken);
    }
  );
  eventsRegistry.registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
    log.warn('PushNotificationAndroid(registerRemoteNotificationsRegistrationFailed): Push notifications registration failed', event);
  });
}

async function register(api: Api) {
  subscribeOnRegistrationEvent((deviceToken: string) => {
    new PushNotificationsProcessor(
      api,
      Router.SingleIssue,
      deviceToken
    );
  });
}

async function unregister(api: Api) {
  await PushNotificationsProcessor.unsubscribe(api, deviceToken);
}

function initialize() {
  Notifications.getInitialNotification()
    .then((notification) => {
      log.info('initializePushNotifications(getInitialNotification):', (notification ? JSON.stringify(notification.payload) : 'N/A'));
      if (notification?.payload?.issueId) {
        log.info(`initializePushNotifications(getInitialNotification): redirecting to the issue ${notification.payload.issueId}`, JSON.stringify(notification.payload));
        Router.SingleIssue({issueId: notification.payload.issueId});
      }
      log.info('initializePushNotifications(getInitialNotification): initialized');
    })
    .catch((err) => log.warn('initializePushNotifications(getInitialNotification): failed', err));
}

export default {
  register,
  unregister,
  initialize
};
