/* @flow */

import PushNotificationIOS from '@react-native-community/push-notification-ios';

import helper, {PushNotifications} from './push-notifications-helper';
import log from '../log/log';
import Router from '../router/router';
import {CUSTOM_ERROR_MESSAGE} from '../error/error-messages';
import {notify} from '../notification/notification';
import {targetAccountToSwitchTo} from '../../actions/app-actions-helper';

import type {StorageState} from '../storage/storage';
import type {TokenHandler} from '../../flow/Notification';

let onSwitch: Function = (account: StorageState, issueId: string): Function => {};

PushNotificationIOS.removeEventListener('notification');
PushNotificationIOS.addEventListener('notification', async (notification) => {
  const notificationData: Object = notification.getData();
  const isClicked: boolean = notificationData.userInteraction === 1;
  const data = `
  Title:  ${notification.getTitle()};\n
  Subtitle:  ${notification.getSubtitle()};\n
  Message: ${notification.getMessage()};\n
  Data: ${notificationData};\n
  badge: ${notification.getBadgeCount()};\n
  sound: ${notification.getSound()};\n
  category: ${notification.getCategory()};\n
  content-available: ${notification.getContentAvailable()};\n
  Notification is clicked: ${String(isClicked)}.`;

  log.info(`Push Notification iOS Received ${JSON.stringify(notification)}`, data);

  const actionIdentifier = notification.getActionIdentifier();

  if (actionIdentifier === 'open') {
    const issueId: ?string = helper.getIssueId(notificationData);
    log.info(`Push Notification iOS(issueID): ${issueId || ''}`);
    if (issueId) {
      const targetBackendUrl = notification?.data?.backendUrl;
      log.info('Push Notification iOS(targetBackendUrl):', targetBackendUrl);
      const targetAccount = await targetAccountToSwitchTo(targetBackendUrl);
      log.info('Push Notification iOS(account to switch to):', targetAccount);
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
});

export default class PushNotificationsProcessor extends PushNotifications {

  static subscribeOnNotificationOpen(onSwitchAccount: (account: StorageState, issueId: string) => any) {
    log.info('Push notifications iOS(subscribeOnNotificationOpen): subscribe to open event');
    onSwitch = onSwitchAccount;
  }

  static unsubscribe() {
    PushNotificationIOS.removeEventListener('register');
    PushNotificationIOS.removeEventListener('registrationError');
    PushNotificationIOS.removeEventListener('notification');
  }

  static init() {
    let resolveToken: TokenHandler = () => {};
    let rejectToken: TokenHandler = () => {};

    this.deviceTokenPromise = new Promise<string>(
      (resolve: TokenHandler, reject: TokenHandler) => {
        resolveToken = resolve;
        rejectToken = reject;
      });

    PushNotificationIOS.addEventListener('register', (deviceToken: string) => {
      this.setDeviceToken(deviceToken);
      resolveToken(deviceToken);
    });

    PushNotificationIOS.addEventListener('registrationError', (error: Error) => {
      rejectToken('');
      notify(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION);
      log.warn('PushNotificationIOS registration failed', error);
    });

    PushNotificationIOS.requestPermissions().then(
      (data) => {
        log.info('PushNotificationIOS.requestPermissions', data);
      },
      (data) => {
        log.warn('PushNotificationIOS.requestPermissions failed', data);
      },
    );
  }
}
