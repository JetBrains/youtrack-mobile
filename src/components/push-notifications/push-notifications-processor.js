/* @flow */

import {Notifications, Notification} from 'react-native-notifications-latest';

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

  API: Api;
  onNotificationOpen: ({ issueId: string }) => void;
  deviceToken: string;

  constructor(api: Api, onNotificationOpen: ({ issueId: string }) => void, deviceToken: string) {
    this.API = api;
    this.onNotificationOpen = onNotificationOpen;
    this.deviceToken = deviceToken;

    this.register();
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

  async register() {
    try {
      const youtrackToken = await this.getYouTrackToken();
      await this.subscribe(youtrackToken, this.deviceToken);
      this.registerNotificationEvents();
      notify('Push notifications enabled', 2);
    } catch (error) {
      const errorMsg = 'Cannot initialize push notifications';
      notify(errorMsg, 2);
      log.warn(`PushNotificationsProcessor(register): ${errorMsg}`, error);
    }
  }

  registerNotificationEvents() {
    Notifications.registerRemoteNotifications();

    const eventsRegistry = Notifications.events();
    const logMsgPrefix: string = 'PushNotificationsProcessor(registerNotificationReceivedForeground): ';

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
        const {issueId, userId}: {issueId: string, userId: string} = notification.payload;
        const msg: string = 'PushNotificationsProcessor(registerNotificationOpened): Notification';
        log.debug(`${msg} ${JSON.stringify(notification.payload)}`);
        log.debug(`${msg} opened issue "${issueId}" by user "${userId}"`);

        if (issueId) {
          this.onNotificationOpen({issueId: notification.payload.issueId});
        }
        completion();
      }
    );
  }

  async getYouTrackToken() {
    const logMsgPrefix: string = 'PushNotificationsProcessor(getYouTrackToken): ';
    try {
      log.info(`${logMsgPrefix}Requesting YouTrack token...`);
      const youTrackToken = await this.API.getNotificationsToken();
      log.info(`${logMsgPrefix}YouTrack token received`);
      return Promise.resolve(youTrackToken);
    } catch (error) {
      if ([400, 404, 405].includes(error?.status)) {
        const errorMsg = `${logMsgPrefix}YT server does not support push notifications`;
        log.warn(errorMsg, error);
        return Promise.reject(new Error(errorMsg));
      }
      throw error;
    }
  }

  async subscribe(youtrackToken: string, deviceToken: string): Promise<any> {
    const logMsgPrefix: string = 'PushNotificationsProcessor(subscribe): ';
    try {
      log.info(`${logMsgPrefix}Subscribing to push notifications...`);
      const url = `${PushNotificationsProcessor.KONNECTOR_URL}/ring/fcmPushNotifications`;
      const response = await this.API.makeAuthorizedRequest(url, 'POST', {
        youtrackToken: youtrackToken,
        deviceToken: deviceToken
      });
      log.info(`${logMsgPrefix}Subscribed to push notifications`);
      return response;
    } catch (error) {
      log.warn(`${logMsgPrefix}Subscribe to push notifications failed`, error);
      return Promise.reject(error);
    }
  }

}
