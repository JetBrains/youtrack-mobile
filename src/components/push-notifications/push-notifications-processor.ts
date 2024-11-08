import {
  Notification,
  Notifications,
  RegistrationError,
} from 'react-native-notifications';
import helper, {PushNotifications} from './push-notifications-helper';
import log from 'components/log/log';
import {getStorageState, StorageState} from 'components/storage/storage';
import {navigateToRouteById} from 'components/router/router-helper';
import {targetAccountToSwitchTo} from 'actions/app-actions-helper';

import type {NotificationCompletion, TokenHandler} from 'types/Notification';
import type {EmitterSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';


export default class PushNotificationsProcessor extends PushNotifications {
  static registerNotificationOpenListener: EmitterSubscription | null = null;

  static subscribeOnNotificationOpen(
    onSwitchAccount: (account: StorageState, issueId?: string, articleId?: string) => any,
  ) {
    log.info(
      'Push notifications(subscribeOnNotificationOpen:Android): subscribe to open event',
    );

    if (this.registerNotificationOpenListener) {
      this.registerNotificationOpenListener.remove &&
        this.registerNotificationOpenListener.remove();
      this.registerNotificationOpenListener = null;
    }

    this.registerNotificationOpenListener = Notifications.events().registerNotificationOpened(
      async (notification: Notification, completion: () => void) => {
        log.info(`Push notifications: On notification open event`);
        const issueId: string | undefined = helper.getIssueId(notification);
        const articleId: string | undefined = helper.getArticleId(notification);
        if (issueId) {
          log.info(`Push notifications: On notification open:: Issue ID detected`);
        }
        if (articleId) {
          log.info(`Push notifications: On notification open:: Article ID detected`);
        }

        if (!issueId && !articleId) {
          return;
        }

        const targetBackendUrl: string = helper.getBackendURL(notification);
        if (targetBackendUrl) {
          log.info(
            `On notification open:: another account URL is detected`,
          );
        }
        const backendUrl = getStorageState().config!.backendUrl;
        log.info(`On notification open:: current account URL is ${backendUrl}`);
        const targetAccount = await targetAccountToSwitchTo(targetBackendUrl, backendUrl);
        if (targetAccount) {
          await onSwitchAccount(targetAccount, issueId, articleId);
          log.info(`On notification open:: switched to target account`);
        } else if (issueId || articleId) {
          log.info(`On notification open:: redirecting to detected Issue ID`);
          navigateToRouteById(issueId, articleId, helper.getActivityId(notification));
        }

        completion();
      },
    );
  }

  static init() {
    let resolveToken: TokenHandler = (token) => {};

    let rejectToken: TokenHandler = (reason) => {};

    this.deviceTokenPromise = new Promise<string>(
      (resolve: TokenHandler, reject: TokenHandler) => {
        resolveToken = resolve;
        rejectToken = reject;
      },
    );
    Notifications.registerRemoteNotifications();
    Notifications.getInitialNotification()
      .then(notification => {
        if (notification) {
          log.info(`Push notifications processor: Initial notification detected`);
        }
      })
      .catch(err => log.info(`Push notifications processor: Initial notification detection failed ${err}`));
    Notifications.events().registerRemoteNotificationsRegistered(
      (event: { deviceToken: string }) => {
        this.setDeviceToken(event.deviceToken);
        resolveToken(event.deviceToken);
      },
    );
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (error: RegistrationError) => rejectToken(error),
    );
    Notifications.events().registerNotificationReceivedForeground(
      (
        notification: Notification,
        completion: (response: NotificationCompletion) => void,
      ) => {
        log.info(`Push notifications processor: Notification received in foreground`);
        completion({
          alert: true,
          sound: true,
          badge: false,
        });
      },
    );
    Notifications.events().registerNotificationReceivedBackground(
      (
        notification: Notification,
        completion: (response: NotificationCompletion) => void,
      ) => {
        log.info(`Push notifications processor: Notification received in background`);
        completion({
          alert: true,
          sound: true,
          badge: false,
        });
      },
    );
  }
}
