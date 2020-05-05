/* @flow */

import PushNotificationsProcessor from './push-notifications-processor';

import type Api from '../api/api';
import {flushStoragePart, getStorageState} from '../storage/storage';
import log from '../log/log';

const componentLogPrefix: string = 'PNAndroid';


function storeDeviceToken(token: string | null) {
  flushStoragePart({deviceToken: token});
}

async function register(api: Api) {
  const deviceToken: string = PushNotificationsProcessor.getDeviceToken();
  if (deviceToken !== null) {
    await PushNotificationsProcessor.subscribe(api, deviceToken);
    storeDeviceToken(deviceToken);
  }
}

async function unregister(api: Api) {
  storeDeviceToken(null);
  return await PushNotificationsProcessor.unsubscribe(api, PushNotificationsProcessor.getDeviceToken());
}

function deviceTokenChanged(deviceToken: string) {
  const storedDeviceToken: string | null = getStorageState().deviceToken;
  return storedDeviceToken !== null && deviceToken !== null && storedDeviceToken !== deviceToken;
}

async function initialize(api) {
  const deviceToken: string = PushNotificationsProcessor.getDeviceToken();
  if (deviceTokenChanged(deviceToken)) {
    log.info(`'${componentLogPrefix}'(initialize): device token has changed, re-subscribe`);
    await register(api);
  }
}

export default {
  register,
  unregister,
  initialize
};
