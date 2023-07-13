import {Alert} from 'react-native';

import appPackage from '../../../package.json';
import log from 'components/log/log';
import {categoryName} from 'components/activity/activity__category';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {getApi} from 'components/api/api__instance';
import {isAndroidPlatform} from 'util/util';

import type Api from '../api/api';
import type {StorageState} from '../storage/storage';
import type {Token} from 'types/Notification';
import {Notification} from 'react-native-notifications';
import {NotificationRouteData} from 'types/Notification';


export class PushNotifications {
  static deviceToken: null | string = null;
  static deviceTokenPromise: null | Promise<string> = null;

  static setDeviceToken(token: string) {
    this.deviceToken = token;
  }

  static async getDeviceToken(): Promise<string | null> {
    return this.deviceTokenPromise;
  }

  static subscribeOnNotificationOpen(
    onSwitchAccount: (account: StorageState, issueId?: string, articleId?: string) => any,
  ): void {}

  static unsubscribe(): void {}

  static init(): void {}
}

const messageDefaultButton: {
  text: string;
  onPress: () => void;
} = {
  text: 'Close',
  onPress: () => {},
};
const KONNECTOR_URL: string = appPackage.config.KONNECTOR_URL;
const logPrefix: string = 'Push Notifications: ';
const logMessages = {
  startSubscribing: `${logPrefix}subscribing...`,
  successSubscribing: `${logPrefix}successfully subscribed`,
  errorSubscribing: `${logPrefix}subscription failed`,
  unsubscribeStart: `${logPrefix}unsubscribing...`,
  unsubscribeSuccess: `${logPrefix}successfully unsubscribed`,
  unsubscribeError: `${logPrefix}unsubscription failed`,
  startReceivingYTToken: `${logPrefix}start receiving YouTrack subscription token...`,
  successReceivingYTToken: `${logPrefix}YouTrack subscription token successfully received`,
  errorReceivingYTToken: `${logPrefix}failed to receive subscription YouTrack token`,
};

async function storeDeviceToken(token: Token) {
  await flushStoragePart({
    deviceToken: token,
  });
}

function getStoredDeviceToken(): Token {
  return getStorageState().deviceToken;
}

function isDeviceTokenChanged(deviceToken: Token): any {
  const storedDeviceToken: Token = getStoredDeviceToken();
  return storedDeviceToken && deviceToken && storedDeviceToken !== deviceToken;
}

function showInfoMessage(
  title: string,
  message: string,
  buttons: Array<Record<string, any>> = [messageDefaultButton],
) {
  Alert.alert(title, message, buttons, {
    cancelable: false,
  });
}

function getIssueId(notification: Notification | null = null): string {
  return (
    getNotificationDataByField(notification, 'issueId') ||
    getNotificationDataByField(notification, 'ytIssueId')
  );
}
function getArticleId(notification: Notification | null = null): string {
  return (
    getNotificationDataByField(notification, 'articleId') ||
    getNotificationDataByField(notification, 'ytArticleId')
  );
}
function getBackendURL(notification: Notification | null = null): string {
  return getNotificationDataByField(notification, 'backendUrl');
}

function getNotificationDataByField(notification: Record<string, any> | null, fieldName: string) {
  return notification ? (
    notification?.payload?.[fieldName] ||
    notification?.[fieldName] ||
    notification?.data?.[fieldName] ||
    notification?.getData?.()?.[fieldName] ||
    ''
  ) : '';
}

function getActivityId(notification: Notification | null = null): string | undefined {
  const categories: string[] = getNotificationDataByField(notification, 'categories').split(',');
  const eventIds: string[] = getNotificationDataByField(notification, 'eventIds').split(',');
  if (!categories?.[0] || !eventIds?.[0]) {
    return undefined;
  }

  const targetEventIdIndex: number = categories.findIndex((it: string) => {
    return ![
      categoryName.DESCRIPTION,
      categoryName.SUMMARY,
      categoryName.ISSUE_CREATED,
      categoryName.ISSUE_CREATED.split('_').pop(),
      categoryName.ARTICLE_CREATED,
      categoryName.ARTICLE_CONTENT,
      categoryName.ARTICLE_SUMMARY,
    ].join(',').toLowerCase().split(',').includes(it.toLowerCase());
  });

  return eventIds[targetEventIdIndex] || eventIds[0] || '';
}

async function subscribe(
  deviceToken: string,
  youtrackToken: string,
): Promise<any> {
  const isAndroid = isAndroidPlatform();
  const api: Api = getApi();
  const resource: (...args: any[]) => any = isAndroid
    ? api.subscribeToFCMNotifications
    : api.subscribeToIOSNotifications;

  try {
    log.info(logMessages.startSubscribing);
    const response = await resource.call(
      api,
      KONNECTOR_URL,
      youtrackToken,
      deviceToken,
    );
    log.info(logMessages.successSubscribing);
    return response;
  } catch (error) {
    log.warn(logMessages.errorSubscribing);
    log.warn(error);
    return Promise.reject(error);
  }
}

async function unsubscribe(deviceToken: string): Promise<any> {
  const api: Api = getApi();
  const resource: (...args: any[]) => any = isAndroidPlatform()
    ? api.unsubscribeFromFCMNotifications
    : api.unsubscribeFromIOSNotifications;

  try {
    log.info(logMessages.unsubscribeStart);
    const response = await resource.call(api, KONNECTOR_URL, deviceToken);
    log.info(logMessages.unsubscribeSuccess);
    return response;
  } catch (error) {
    log.warn(logMessages.unsubscribeError, error);
    return null;
  }
}

async function loadYouTrackToken(): Promise<string | null> {
  try {
    log.info(logMessages.startReceivingYTToken);
    const api: Api = getApi();
    const youTrackToken: string = await api.getNotificationsToken.call(api);
    log.info(logMessages.successReceivingYTToken);
    return youTrackToken;
  } catch (error) {
    log.warn(`${logMessages.errorReceivingYTToken}`, error);
    return null;
  }
}

const getNotificationRouteData = (notification?: Notification): NotificationRouteData => ({
  issueId: getIssueId(notification),
  articleId: getArticleId(notification),
  backendUrl: getBackendURL(notification),
  navigateToActivity: getActivityId(notification),
});


export default {
  storeDeviceToken,
  getStoredDeviceToken,
  isDeviceTokenChanged,
  showInfoMessage,
  getIssueId,
  getArticleId,
  loadYouTrackToken,
  subscribe,
  unsubscribe,
  logPrefix,
  KONNECTOR_URL,
  getActivityId,
  getBackendURL,
  getNotificationRouteData,
};
