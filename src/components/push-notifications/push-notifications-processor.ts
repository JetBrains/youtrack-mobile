import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
} from 'react-native-notifications';
import helper, {PushNotifications} from './push-notifications-helper';
import log from '../log/log';
import Router from '../router/router';
import {isSplitView} from '../responsive/responsive-helper';
import {targetAccountToSwitchTo} from 'actions/app-actions-helper';
import type EmitterSubscription from 'react-native/Libraries/vendor/emitter/_EmitterSubscription';
import type {NotificationCompletion, TokenHandler} from 'types/Notification';
import type {StorageState} from '../storage/storage';
export default class PushNotificationsProcessor extends PushNotifications {
  static registerNotificationOpenListener:
    | EmitterSubscription
    | null
    | undefined = null;

  static subscribeOnNotificationOpen(
    onSwitchAccount: (account: StorageState, issueId: string) => any,
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
      async (notification: typeof Notification, completion: () => void) => {
        log.info(`On notification open:: ${JSON.stringify(notification)}`);
        const issueId: string | null | undefined = helper.getIssueId(
          notification,
        );
        log.info(`On notification open:: issue ID ${issueId}`);

        if (!issueId) {
          return;
        }

        const targetBackendUrl = notification?.payload?.backendUrl;
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
          await onSwitchAccount(targetAccount, issueId);
          log.info(`On notification open:: switched to target account`);
        } else if (issueId) {
          log.info(`On notification open:: redirecting to ${issueId}`);

          if (isSplitView()) {
            Router.Issues({
              issueId,
            });
          } else {
            Router.Issue({
              issueId,
              navigateToActivity: helper.getActivityId(notification),
            });
          }
        }

        completion();
      },
    );
  }

  static init() {
    let resolveToken: TokenHandler = () => {};

    let rejectToken: TokenHandler = () => {};

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
      (event: typeof Registered) => {
        this.setDeviceToken(event.deviceToken);
        resolveToken(event.deviceToken);
      },
    );
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (error: typeof RegistrationError) => rejectToken(error),
    );
    Notifications.events().registerNotificationReceivedForeground(
      (
        notification: typeof Notification,
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
        notification: typeof Notification,
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
