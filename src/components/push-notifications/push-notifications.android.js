/* @flow */

import PushNotificationsProcessor from './push-notifications-processor';

import type Api from '../api/api';
import {flushStoragePart, getStorageState} from '../storage/storage';
import log from '../log/log';
import {Alert} from 'react-native';
import {resolveErrorMessage} from '../error-message/error-resolver';
import ReporterBugsnag from '../error-boundary/reporter-bugsnag';

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

async function register(api: Api) {
  const deviceToken = await getDeviceToken();

  if (deviceToken === null) {
    return;
  }

  const reportError = (error: Error) => ReporterBugsnag.notify(error);
  const doSubscribe = async () => {
    await PushNotificationsProcessor.subscribe(api, deviceToken);
    if (getStorageState().deviceToken === null) {
      showInfoMessage(
        'You are subscribed to push notifications',
        'Make sure that the following application notifications options in your device settings are allowed:\n• Show\n• Sound\n• Vibration\n• LED light\n'
      );
    }
    storeDeviceToken(deviceToken);
  };

  try {
    await doSubscribe();
  } catch (error) {
    storeDeviceToken(null);

    const errorMessage: string = await resolveErrorMessage(error);
    const reSubscribe = async () => {
      try {
        await doSubscribe();
      } catch (err) {
        reportError(err);
        showInfoMessage('Server overloaded', 'We will try to subscribe you next time when you open the application.');
      }
    };

    showInfoMessage(
      'Push notification subscription error',
      errorMessage.substr(0, 300),
      [
        messageDefaultButton,
        {
          text: 'Report',
          onPress: () => reportError(error)
        },
        {
          text: 'Subscribe again',
          onPress: reSubscribe
        }
      ]
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
