/* @flow */

import PushNotificationsProcessor from './push-notifications-processor';

import type Api from '../api/api';
import {flushStoragePart, getStorageState} from '../storage/storage';
import log from '../log/log';
import {Alert} from 'react-native';
import {isUnsupportedFeatureError} from '../error/error-resolver';
import {reportError} from '../error/error-reporter';
import {DEFAULT_ERROR_MESSAGE} from '../error/error-codes';

const componentLogPrefix: string = 'PNAndroid';
const messageDefaultButton: Object = {
  text: 'Close',
  onPress: () => {}
};


function storeDeviceToken(token: string | null) {
  flushStoragePart({deviceToken: token});
}

async function getDeviceToken() {
  let deviceToken: string;
  try {
    deviceToken = await PushNotificationsProcessor.getDeviceToken();
  } catch (e) {
    deviceToken = null;
  }
  return deviceToken;
}

function showInfoMessage(title: string, message: string, buttons: Array<Object> = [messageDefaultButton]) {
  Alert.alert(
    title,
    message,
    buttons,
    {cancelable: false}
  );
}

async function getYouTrackToken(api: Api) {
  let youtrackToken: string | null = null;
  try {
    youtrackToken = await PushNotificationsProcessor.getYouTrackToken(api);
  } catch (e) {
    log.debug(e);
    throw e;
  }
  return youtrackToken;
}

async function register(api: Api) {
  const deviceToken = await getDeviceToken();
  if (deviceToken === null) {
    return;
  }

  const youtrackToken = await getYouTrackToken(api);
  // The method call above throws if YT instance doesn't support push notifications and the following code is not invoked

  let isSecondTry: boolean = false;
  await doSubscribe();


  async function doSubscribe() {
    let alertErrorMessage: string;
    let alertExtraButton = [];

    try {
      await PushNotificationsProcessor.subscribe(api, deviceToken, youtrackToken);
      showSuccessMessage();
      storeDeviceToken(deviceToken);
    } catch (error) {
      if (isUnsupportedFeatureError(error)) {
        return;
      }

      reportError(error);
      storeDeviceToken(null);

      if (isSecondTry) {
        alertErrorMessage = 'Server not responding. We will try to subscribe you later.';
        alertExtraButton = [];
      } else {
        alertErrorMessage = `${DEFAULT_ERROR_MESSAGE} We can't subscribe next time when you open the application.`;
        alertExtraButton = [{
          text: 'Try again',
          onPress: doSubscribe
        }];
      }

      showErrorMessage(alertErrorMessage, alertExtraButton);
      isSecondTry = true;
    }
  }

  function showSuccessMessage() {
    if (getStorageState().deviceToken === null) {
      showInfoMessage(
        'You are subscribed to push notifications',
        'Make sure that the following application notifications options in your device settings are allowed:\n• Show\n• Sound\n• Vibration\n• LED light\n'
      );
    }
  }

  function showErrorMessage(message: string, extraButton: Array<?Object>) {
    showInfoMessage(
      'Push notification subscription error',
      message,
      [messageDefaultButton].concat(extraButton)
    );
  }
}

async function unregister(api: Api) {
  storeDeviceToken(null);
  const deviceToken: string = await getDeviceToken();
  if (deviceToken) {
    return await PushNotificationsProcessor.unsubscribe(api, deviceToken);
  }
}

function deviceTokenChanged(deviceToken: string) {
  const storedDeviceToken: string | null = getStorageState().deviceToken;
  return storedDeviceToken !== null && deviceToken !== null && storedDeviceToken !== deviceToken;
}

async function initialize(api) {
  const deviceToken: string = await getDeviceToken();
  if (deviceTokenChanged(deviceToken)) {
    log.info(`'${componentLogPrefix}'(initialize): device token has changed, re-subscribe`);
    await register(api);
  }

  PushNotificationsProcessor.subscribeOnNotificationOpen();
}

export default {
  register,
  unregister,
  initialize
};
