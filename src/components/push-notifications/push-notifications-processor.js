/* @flow */

import {Notifications, Notification, Registered, RegistrationError} from 'react-native-notifications-latest';

import {notify} from '../notification/notification';
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import log from '../log/log';

import type Api from '../api/api';

type NotificationCompletion = { // TS interfaces that are used in `react-native-notifications-latest` module
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
}


export default class PushNotificationsProcessor {
  static KONNECTOR_URL = appPackage.config.KONNECTOR_URL;

  static subscribeOnRegistrationEvent(onSuccess: (deviceToken: string) => void, onError: (error: RegistrationError) => void) {
    const eventsRegistry = Notifications.events();
    eventsRegistry.registerRemoteNotificationsRegistered(
      (event: Registered) => {
        onSuccess(event.deviceToken);
      }
    );
    eventsRegistry.registerRemoteNotificationsRegistrationFailed((error: RegistrationError) => {
      onError(error);
    });
  }

  static registerNotificationEvents(onNotificationOpen: (issueId: string) => void) {
    const eventsRegistry = Notifications.events();
    const logMsgPrefix: string = 'PushNotificationsProcessor(registerNotificationReceivedForeground): ';

    Notifications.registerRemoteNotifications();

    eventsRegistry.registerNotificationReceivedForeground(
      (notification: Notification, completion: (response: NotificationCompletion) => void) => {
        log.debug(`${logMsgPrefix}Notification received in foreground: ${JSON.stringify(notification.payload)}`);
        completion({alert: false, sound: false, badge: false});
      }
    );

    eventsRegistry.registerNotificationReceivedBackground(
      (notification: Notification, completion: (response: NotificationCompletion) => void) => {
        log.debug(`${logMsgPrefix}Notification received in background: ${JSON.stringify(notification.payload)}`);
        completion({alert: true, sound: true, badge: false});
      }
    );

    eventsRegistry.registerNotificationOpened(
      (notification: Notification, completion: () => void) => {
        const {issueId, userId}: { issueId: string, userId: string } = notification.payload;
        const msg: string = 'PushNotificationsProcessor(registerNotificationOpened): Notification';
        log.debug(`${msg} ${JSON.stringify(notification.payload)}`);
        log.debug(`${msg} opened issue "${issueId}" by user "${userId}"`);

        onNotificationOpen(issueId);
        completion();
      }
    );
  }

  static async unsubscribe(api: Api, deviceToken: string) {
    const logMsgPrefix: string = 'PushNotificationsProcessor(unsubscribe): ';
    log.info(`${logMsgPrefix}Unsubscribing from push notifications...`);
    const url = `${PushNotificationsProcessor.KONNECTOR_URL}/ring/fcmPushNotifications/unsubscribe`;
    try {
      await api.makeAuthorizedRequest(url, 'POST', {deviceToken: deviceToken});
      log.info(`${logMsgPrefix}Successfully unsubscribed from push notifications`);
    } catch (error) {
      const errorMsg = 'Failed to unsubscribed from push notifications';
      log.warn(`${logMsgPrefix}${errorMsg}`, error);
      notify(errorMsg);
    }
  }

  static async getYouTrackToken(api: Api) {
    const logMsgPrefix: string = 'PushNotificationsProcessor(getYouTrackToken): ';
    try {
      log.info(`${logMsgPrefix}Requesting YouTrack token...`);
      const youTrackToken = await api.getNotificationsToken();
      log.info(`${logMsgPrefix}YouTrack token received`);
      return youTrackToken;
    } catch (error) {
      let err: Error = error;
      if ([400, 404, 405].includes(error?.status)) {
        const errorMsg = `${logMsgPrefix}YT server does not support push notifications`;
        log.warn(errorMsg, error);
        err = new Error(errorMsg);
      }
      throw err;
    }
  }

  static async subscribe(api: Api, deviceToken: string): Promise<any> {
    const logMsgPrefix: string = 'PushNotificationsProcessor(subscribe): ';
    try {
      const youtrackToken = await PushNotificationsProcessor.getYouTrackToken(api);
      log.info(`${logMsgPrefix}Subscribing to push notifications...`);
      const response = api.subscribeToFCMNotifications(
        PushNotificationsProcessor.KONNECTOR_URL,
        youtrackToken,
        deviceToken
      );
      log.info(`${logMsgPrefix}Subscribed to push notifications`);
      return response;
    } catch (error) {
      log.warn(`${logMsgPrefix}Subscribe to push notifications failed`, error);
      return Promise.reject(error);
    }
  }

}
