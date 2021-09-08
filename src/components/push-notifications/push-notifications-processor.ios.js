/* @flow */

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

import helper, {PushNotifications} from './push-notifications-helper';
import log from '../log/log';
import Router from '../router/router';
import {CUSTOM_ERROR_MESSAGE} from '../error/error-messages';
import {notify} from '../notification/notification';
import {targetAccountToSwitchTo} from '../../actions/app-actions-helper';

import type {StorageState} from '../storage/storage';
import type {TokenHandler} from '../../flow/Notification';

type NotificationData = {
  backendUrl?: string,
  ytUserId: string,
  categories: string,
  ytIssueId: string,
};

let onSwitch: Function = (account: StorageState, issueId: string): Function => {};

const onNotification = async (notification: {
  foreground: false, // BOOLEAN: If the notification was received in foreground or not
  userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
  message: string, // STRING: The notification message
  data: NotificationData, // OBJECT: The push data or the defined userInfo in local notifications
}) => {
  const notificationData: NotificationData = notification.data;
  log.info(`Push Notification iOS Received ${JSON.stringify(notification)}`);
  log.info(`Push Notification iOS Data ${JSON.stringify(notificationData)}`);

  if (notification.userInteraction) {
    const issueId: ?string = helper.getIssueId(notificationData);
    log.info(`Push Notification iOS(issueID): ${issueId || ''}`);

    if (issueId) {
      const targetBackendUrl: string = notification?.backendUrl || '';
      log.info('Push Notification iOS(targetBackendUrl):', targetBackendUrl);
      const targetAccount: StorageState | null = await targetAccountToSwitchTo(targetBackendUrl);
      log.info(`Push Notification iOS(account to switch to): ${targetAccount?.config?.backendUrl || ''}`);
      if (targetAccount) {
        log.info('Push Notification iOS: switching account');
        await onSwitch(targetAccount, issueId);
      } else if (issueId) {
        log.info('Push Notification iOS(navigating to):', issueId);
        Router.Issue({
          issueId,
          navigateToActivity: !helper.isSummaryOrDescriptionNotification(notification),
        });
      }
    }

  }
};

export default class PushNotificationsProcessor extends PushNotifications {

  static subscribeOnNotificationOpen(onSwitchAccount: (account: StorageState, issueId: string) => any) {
    log.info('Push notifications iOS(subscribeOnNotificationOpen): subscribe to open event');
    onSwitch = onSwitchAccount;
  }

  static init() {
    let resolveToken: TokenHandler = () => {};
    let rejectToken: TokenHandler = () => {};

    this.deviceTokenPromise = new Promise<string>(
      (resolve: TokenHandler, reject: TokenHandler) => {
        resolveToken = resolve;
        rejectToken = reject;
      });

    PushNotification.configure({
      onRegister: function (deviceToken: string) {
        this.setDeviceToken(deviceToken);
        resolveToken(deviceToken);
      },

      onNotification: function (notification) {
        onNotification(notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      onAction: function (notification) {},

      onRegistrationError: function(err) {
        rejectToken('');
        notify([CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION, (err?.message || '')].join('. '));
        log.warn('PushNotificationIOS registration failed', err?.message);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,

      requestPermissions: true,
    });
  }
}
