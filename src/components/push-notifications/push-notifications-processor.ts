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

import type {NotificationCompletion} from 'types/Notification';
import type {EmitterSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';


export default class PushNotificationsProcessor extends PushNotifications {
  static registerNotificationOpenListener: EmitterSubscription | null = null;
  static initSubscriptions: EmitterSubscription[] = [];

  // Timestamp of the most recent navigation triggered by a notification tap.
  // `completeInitialization` consults this to avoid a concurrent app-bootstrap
  // resetting the stack to the default route on top of the just-opened entity.
  static lastNotificationNavigationAt = 0;
  static readonly NOTIFICATION_NAV_WINDOW_MS = 5000;

  // True when a notification tap navigated within the last
  // `NOTIFICATION_NAV_WINDOW_MS`. Used as a re-init guard.
  static hadRecentNotificationNavigation(): boolean {
    return Date.now() - this.lastNotificationNavigationAt < this.NOTIFICATION_NAV_WINDOW_MS;
  }

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

        // Record that a tap just drove navigation so a concurrent app bootstrap
        // does not reset the stack to the default route on top of it.
        PushNotificationsProcessor.lastNotificationNavigationAt = Date.now();

        completion();
      },
    );
  }

  static init() {
    // `init()` runs on every subscribe attempt / account switch. Remove any
    // listeners attached by a previous call first — otherwise they accumulate
    // and a single native event invokes every stale callback (duplicate
    // `completion(...)` calls for received notifications, duplicate logs, and an
    // unbounded listener leak over the app's lifetime).
    this.initSubscriptions.forEach(subscription => subscription?.remove?.());
    this.initSubscriptions = [];

    let resolveToken: (value: string | PromiseLike<string>) => void = () => {};
    let rejectToken: (reason?: any) => void = () => {};

    this.deviceTokenPromise = new Promise<string>(
      (resolve, reject) => {
        resolveToken = resolve;
        rejectToken = reject;
      },
    );

    // IMPORTANT: attach the token listeners BEFORE calling
    // `registerRemoteNotifications()`. On Android the (often cached) FCM token is
    // delivered synchronously/immediately, so if registration is requested first
    // the `registerRemoteNotificationsRegistered` event fires before this listener
    // exists — the token is missed, `deviceTokenPromise` never settles, and every
    // `getDeviceToken()` caller (i.e. the subscription flow) hangs forever.
    // See https://wix.github.io/react-native-notifications/docs/subscription/
    this.initSubscriptions.push(
      Notifications.events().registerRemoteNotificationsRegistered(
        (event: { deviceToken: string }) => {
          log.info(`Push notifications processor: Device token received`);
          this.setDeviceToken(event.deviceToken);
          resolveToken(event.deviceToken);
        },
      ),
    );
    this.initSubscriptions.push(
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        (error: RegistrationError) => {
          log.warn(`Push notifications processor: Remote notifications registration failed`, error);
          rejectToken(error);
        },
      ),
    );
    this.initSubscriptions.push(
      Notifications.events().registerNotificationReceivedForeground(
        (
          _notification: Notification,
          completion: (response: NotificationCompletion) => void,
        ) => {
          log.info(`Push notifications processor: Notification received in foreground`);
          completion({
            alert: true,
            sound: true,
            badge: false,
          });
        },
      ),
    );
    this.initSubscriptions.push(
      Notifications.events().registerNotificationReceivedBackground(
        (
          _notification: Notification,
          completion: (response: NotificationCompletion) => void,
        ) => {
          log.info(`Push notifications processor: Notification received in background`);
          completion({
            alert: true,
            sound: true,
            badge: false,
          });
        },
      ),
    );

    Notifications.getInitialNotification()
      .then(notification => {
        if (notification) {
          log.info(`Push notifications processor: Initial notification detected`);
        }
      })
      .catch(err => log.info(`Push notifications processor: Initial notification detection failed ${err}`));

    // All listeners are attached — now it is safe to request registration.
    Notifications.registerRemoteNotifications();
  }
}
