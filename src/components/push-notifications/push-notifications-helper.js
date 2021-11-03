/* @flow */

import {Alert} from 'react-native';

import appPackage from '../../../package.json';
import log from '../log/log';
import {categoryName} from '../activity/activity__category';
import {flushStoragePart, getStorageState} from '../storage/storage';
import {getApi} from '../api/api__instance';
import {isAndroidPlatform} from '../../util/util';
import {UNSUPPORTED_ERRORS} from '../error/error-messages';

import type Api from '../api/api';
import type {Token} from '../../flow/Notification';
import type {CustomError} from '../../flow/Error';
import type {StorageState} from '../storage/storage';


export class PushNotifications {
  static deviceToken: null | string = null;
  static deviceTokenPromise: null | Promise<string> = null;

  static setDeviceToken(token: string) {
    this.deviceToken = token;
  }
  static async getDeviceToken(): Promise<string | null> {
    return this.deviceTokenPromise;
  }
  static subscribeOnNotificationOpen(onSwitchAccount: (account: StorageState, issueId: string) => any): void {}
  static unsubscribe(): void {}
  static init(): void {}
}

const messageDefaultButton: { text: string, onPress: () => void } = {
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
  await flushStoragePart({deviceToken: token});
}

function getStoredDeviceToken(): Token {
  return getStorageState().deviceToken;
}

function isDeviceTokenChanged(deviceToken: Token): any {
  const storedDeviceToken: Token = getStoredDeviceToken();
  return storedDeviceToken && deviceToken && storedDeviceToken !== deviceToken;
}

function showInfoMessage(title: string, message: string, buttons: Array<Object> = [messageDefaultButton]) {
  Alert.alert(
    title,
    message,
    buttons,
    {cancelable: false}
  );
}


function getIssueId(notification: Object): ?string {
  return (
    notification?.payload?.issueId ||
    notification?.payload?.ytIssueId ||
    notification?.ytIssueId ||
    notification?.data?.ytIssueId ||
    notification?.getData && notification.getData().ytIssueId ||
    notification?.issueId ||
    notification?.data?.issueId
  );
}

function getBackendUrl(notification: Object): ?string {
  const data: Object = notification?.getData && notification.getData();
  return (
    data?.backendUrl ||
    notification?.backendUrl ||
    notification?.data?.backendUrl ||
    notification?.payload?.backendUrl
  );
}

function isSummaryOrDescriptionNotification(notification: Object): boolean {
  const categories: Array<string> = (
    notification?.categories ||
    notification?.data?.categories ||
    notification?.payload?.categories ||
    ''
  ).split(',');
  if (categories.length === 0 || !categories[0]) {
    return false;
  }
  const categoryId: string = categories[0].toLowerCase();
  return (
     categoryId === categoryName.DESCRIPTION.toLowerCase() ||
     categoryId === categoryName.SUMMARY.toLowerCase()
   );
}

function composeError(error: CustomError): Error {
  let err: Error = error;
  if ([400, 404, 405].includes(error?.status)) {
    err = new Error(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
  }
  return err;
}

async function subscribe(deviceToken: string, youtrackToken: string): Promise<any> {
  const isAndroid = isAndroidPlatform();
  const api: Api = getApi();
  const resource: Function = (
    isAndroid
      ? api.subscribeToFCMNotifications
      : api.subscribeToIOSNotifications
  );
  try {
    log.info(logMessages.startSubscribing);
    const response = await resource.call(
      api,
      KONNECTOR_URL,
      youtrackToken,
      deviceToken
    );
    log.info(logMessages.successSubscribing);
    return response;
  } catch (error) {
    log.warn(logMessages.errorSubscribing, composeError(error));
    return Promise.reject(error);
  }
}

async function unsubscribe(deviceToken: string): Promise<any> {
  const api: Api = getApi();
  const resource: Function = (
    isAndroidPlatform()
      ? api.unsubscribeFromFCMNotifications
      : api.unsubscribeFromIOSNotifications
  );
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
    log.warn(`${logMessages.errorReceivingYTToken}::${error}`, error);
    return null;
  }
}


export default {
  storeDeviceToken,
  getStoredDeviceToken,
  isDeviceTokenChanged,
  showInfoMessage,
  getIssueId,
  loadYouTrackToken,
  subscribe,
  unsubscribe,
  logPrefix,
  KONNECTOR_URL,
  composeError,
  isSummaryOrDescriptionNotification,
  getBackendUrl,
};
