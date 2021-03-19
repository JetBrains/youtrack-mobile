/* @flow */

import PushNotificationsProcessor from './push-notifications-processor';
import PNHelper from './push-notifications-helper';

import {isUnsupportedFeatureError} from '../error/error-resolver';
import log from '../log/log';

import type Api from '../api/api';
import type {StorageState} from '../storage/storage';
import type {Token} from '../../flow/Notification';

const componentLogPrefix: string = 'PNotifications';


async function getDeviceToken(): Token {
  let deviceToken: Token = null;
  try {
    deviceToken = await PushNotificationsProcessor.getDeviceToken();
  } catch (e) {
    log.warn(`${componentLogPrefix}: cannot retrieve device token from the phone`, e);
  }
  return deviceToken;
}

async function getYouTrackToken(api: Api) {
  let youtrackToken: Token = null;
  try {
    youtrackToken = await PushNotificationsProcessor.getYouTrackToken(api);
  } catch (e) {
    log.warn(`${componentLogPrefix}: cannot get YouTrack subscription`, e);
  }
  return youtrackToken;
}

async function doSubscribe(api: Api, youtrackToken: string, deviceToken: string) {
  try {
    await PushNotificationsProcessor.subscribe(api, deviceToken, youtrackToken);
    showSuccessMessage();
    PNHelper.storeDeviceToken(deviceToken);
  } catch (error) {
    PNHelper.storeDeviceToken(null);

    if (isUnsupportedFeatureError(error)) {
      return log.info(`${componentLogPrefix}: push notifications are not supported in your version of YouTrack`);
    }

    log.warn(`${componentLogPrefix}: failed to subscribe`, error);
  }

  function showSuccessMessage() {
    if (!PNHelper.getStoredDeviceToken()) {
      PNHelper.showInfoMessage(
        'You are subscribed to push notifications',
        'Make sure that the following application notifications options in your device settings are allowed:\n• Show\n• Sound\n• Vibration\n• LED light\n'
      );
    }
  }
}

async function register(api: Api) {
  const deviceToken: Token = await getDeviceToken();

  if (deviceToken) {
    const youtrackToken: Token = await getYouTrackToken(api);
    if (youtrackToken) {
      await doSubscribe(api, youtrackToken, deviceToken);
    }
  }
}

async function unregister(api: Api) {
  PNHelper.storeDeviceToken(null);
  const deviceToken: Token = await getDeviceToken();

  if (deviceToken) {
    return await PushNotificationsProcessor.unsubscribe(api, deviceToken);
  }
}

async function initialize(api, onSwitchAccount: (account: StorageState, issueId: string) => any) {
  const deviceToken: Token = await getDeviceToken();

  if (PNHelper.isDeviceTokenChanged(deviceToken)) {
    log.info(`'${componentLogPrefix}'(initialize): device token has changed, re-subscribe`);
    await register(api);
  }

  PushNotificationsProcessor.subscribeOnNotificationOpen(onSwitchAccount);
}

export default {
  register,
  unregister,
  initialize,
};
