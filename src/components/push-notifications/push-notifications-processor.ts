import {
  Notification,
  Notifications,
  RegistrationError,
} from 'react-native-notifications';
import helper, {PushNotifications} from './push-notifications-helper';
import log from 'components/log/log';
import {navigateToRouteById} from 'components/router/router-helper';
import {targetAccountToSwitchTo} from 'actions/app-actions-helper';

import type {NotificationCompletion, TokenHandler} from 'types/Notification';
import type {StorageState} from 'components/storage/storage';
import {EmitterSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';


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
        log.info(`On notification open:: ${JSON.stringify(notification)}`);
        const issueId: string | undefined = helper.getIssueId(notification);
        const articleId: string | undefined = helper.getArticleId(notification);
        log.info(`On notification open:: issue ID ${issueId}`);

        if (!issueId && !articleId) {
          return;
        }

        const targetBackendUrl: string = helper.getBackendURL(notification);
        log.info(
          `On notification open:: notification?.payload?.backendUrl ${JSON.stringify(
            targetBackendUrl,
          )}`,
        );
        const targetAccount = await targetAccountToSwitchTo(targetBackendUrl);
        log.info(
          `On notification open:: target account ${
            targetAccount?.config?.backendUrl || ''
          }`,
        );

        if (targetAccount) {
          await onSwitchAccount(targetAccount, issueId, articleId);
          log.info(`On notification open:: switched to target account`);
        } else if (issueId || articleId) {
          log.info(`On notification open:: redirecting to ${issueId}`);
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
        log.info(`Initial notification:: ${JSON.stringify(notification)}`);
      })
      .catch(err => log.info(`Initial notification::failed ${err}`));
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
        log.info(
          `Notification received in foreground:: ${JSON.stringify(
            notification,
          )}`,
        );
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
        log.info(
          `Notification received in background:: ${JSON.stringify(
            notification,
          )}`,
        );
        completion({
          alert: true,
          sound: true,
          badge: false,
        });
      },
    );
  }
}
