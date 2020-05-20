/* @flow */

import {Notifications, Notification, Registered, RegistrationError} from 'react-native-notifications-latest';

import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import log from '../log/log';

import Router from '../router/router';
import {UNSUPPORTED_ERRORS} from '../error/error-codes';

import type Api from '../api/api';
import type {CustomError} from '../../flow/Error';

type NotificationCompletion = { // TS interfaces that are used in `react-native-notifications-latest` module
  badge?: boolean;
  alert?: boolean;
  sound?: boolean;
}
type TokenHandler = (token: string) => void;


export default class PushNotificationsProcessor {
  static KONNECTOR_URL = appPackage.config.KONNECTOR_URL;
  static deviceToken = null;
  static logPrefix = 'PNProcessor';
  static deviceTokenPromise = null;

  static logData(message: string, data: Object) {
    log.debug(`${message} ${data ? JSON.stringify(data) : 'N/A'}`);
  }

  static setDeviceToken(token: string) {
    PushNotificationsProcessor.deviceToken = token;
    log.info(`${PushNotificationsProcessor.logPrefix}(setDeviceToken): ${token}`);
  }

  static async getDeviceToken(): Promise<string | null> {
    return PushNotificationsProcessor.deviceTokenPromise;
  }

  static onNotification(issueId?: string) {
    if (issueId) {
      Router.SingleIssue({issueId});
    } else {
      log.warn('No "issueId" param is found in a notification payload');
    }
  }

  static getIssueId(notification: Object) {
    return notification?.issueId || notification?.payload?.issueId || notification?.data?.issueId;
  }

  static async init() {
    const logMsgPrefix: string = `${PushNotificationsProcessor.logPrefix}(init): `;
    let resolveToken: TokenHandler = () => {};
    let rejectToken: TokenHandler = () => {};

    PushNotificationsProcessor.deviceTokenPromise = new Promise<string>((resolve: TokenHandler, reject: TokenHandler) => {
      resolveToken = resolve;
      rejectToken = reject;
    });

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        PushNotificationsProcessor.setDeviceToken(event.deviceToken);
        resolveToken(event.deviceToken);
      }
    );

    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (error: RegistrationError) => rejectToken(error)
    );

    Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion: (response: NotificationCompletion) => void) => {
        PushNotificationsProcessor.logData(`${logMsgPrefix}Foreground notification:`, notification);
        completion({alert: false, sound: false, badge: false});
      }
    );

    Notifications.events().registerNotificationReceivedBackground(
      (notification: Notification, completion: (response: NotificationCompletion) => void) => {
        PushNotificationsProcessor.logData(`${logMsgPrefix}Background notification:`, notification);
        completion({alert: true, sound: true, badge: false});
      }
    );
  }

  static subscribeOnNotificationOpen() {
    Notifications.events().registerNotificationOpened(
      (notification: Notification, completion: () => void) => {
        PushNotificationsProcessor.logData(`${PushNotificationsProcessor.logPrefix}(open):`, notification);

        PushNotificationsProcessor.onNotification(
          PushNotificationsProcessor.getIssueId(notification)
        );

        completion();
      });
  }

  static composeError(error: CustomError) {
    let err: Error = error;
    if ([400, 404, 405].includes(error?.status)) {
      err = new Error(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
    }
    return err;
  }

  static async unsubscribe(api: Api, deviceToken: string) {
    const logMsgPrefix: string = `${PushNotificationsProcessor.logPrefix}(unsubscribe): `;
    log.info(`${logMsgPrefix}Unsubscribing from push notifications...`);
    const url = `${PushNotificationsProcessor.KONNECTOR_URL}/ring/fcmPushNotifications/unsubscribe`;
    try {
      await api.makeAuthorizedRequest(url, 'POST', {deviceToken: deviceToken});
      log.info(`${logMsgPrefix}Successfully unsubscribed from push notifications`);
    } catch (error) {
      const errorMsg = 'Failed to unsubscribed from push notifications';
      log.warn(`${logMsgPrefix}${errorMsg}`, error);
    }
  }

  static async getYouTrackToken(api: Api) {
    const logMsgPrefix: string = `${PushNotificationsProcessor.logPrefix}(getYouTrackToken): `;
    try {
      log.info(`${logMsgPrefix}Requesting YouTrack token...`);
      const youTrackToken = await api.getNotificationsToken();
      log.info(`${logMsgPrefix}YouTrack token received`);
      return youTrackToken;
    } catch (error) {
      throw PushNotificationsProcessor.composeError(error);
    }
  }

  static async subscribe(api: Api, deviceToken: string, youtrackToken: string): Promise<any> {
    const logMsgPrefix: string = `${PushNotificationsProcessor.logPrefix}(subscribe): `;
    try {
      log.info(`${logMsgPrefix}Subscribing to push notifications...`);
      const response = await api.subscribeToFCMNotifications(
        PushNotificationsProcessor.KONNECTOR_URL,
        youtrackToken,
        deviceToken
      );
      log.info(`${logMsgPrefix}Subscribed to push notifications`);
      return response;
    } catch (error) {
      const err = PushNotificationsProcessor.composeError(error);
      log.warn(`${logMsgPrefix}Subscribe to push notifications failed`, err);
      return Promise.reject(error);
    }
  }
}
