/* @flow */

import {Notification, Notifications, Registered, RegistrationError} from 'react-native-notifications-latest';

import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

import log from '../log/log';
import Router from '../router/router';
import {targetAccountToSwitchTo} from '../../actions/app-actions-helper';
import {UNSUPPORTED_ERRORS} from '../error/error-messages';

import type Api from '../api/api';
import type EmitterSubscription from 'react-native/Libraries/vendor/emitter/EmitterSubscription';
import type {CustomError} from '../../flow/Error';
import type {NotificationCompletion, TokenHandler} from '../../flow/Notification';
import type {StorageState} from '../storage/storage';


export default class PushNotificationsProcessor {
  static KONNECTOR_URL = appPackage.config.KONNECTOR_URL;
  static deviceToken = null;
  static logPrefix = 'PNProcessor';
  static deviceTokenPromise = null;
  static registrationListeners: Array<Function> = [];

  static logData(message: string, data: Object) {
    log.debug(`${message} ${data ? JSON.stringify(data) : 'N/A'}`);
  }

  static setDeviceToken(token: string) {
    PushNotificationsProcessor.deviceToken = token;
  }

  static async getDeviceToken(): Promise<string | null> {
    return PushNotificationsProcessor.deviceTokenPromise;
  }

  static getIssueId(notification: Object) {
    return notification?.issueId || notification?.payload?.issueId || notification?.data?.issueId;
  }

  static subscribeOnNotificationOpen(onSwitchAccount: (account: StorageState, issueId: string) => any) {
    if (this.registrationListeners.length > 0) {
      this.registrationListeners.forEach((it: EmitterSubscription) => it.remove());
    }

    this.registrationListeners.push(
      Notifications.events().registerNotificationOpened(
        async (notification: Notification, completion: () => void) => {

          const issueId: ?string = PushNotificationsProcessor.getIssueId(notification);
          if (!issueId) {
            return;
          }

          const targetBackendUrl = notification?.payload?.backendUrl;
          const targetAccount = await targetAccountToSwitchTo(targetBackendUrl);
          if (targetAccount) {
            await onSwitchAccount(targetAccount, issueId);
          } else if (issueId) {
            Router.SingleIssue({issueId});
          }

          completion();
        }
      )
    );
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

  static async init() {
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
        completion({alert: false, sound: false, badge: false});
      }
    );

    Notifications.events().registerNotificationReceivedBackground(
      (notification: Notification, completion: (response: NotificationCompletion) => void) => {
        completion({alert: true, sound: true, badge: false});
      }
    );
  }
}
