import log from 'components/log/log';
import PNHelper from './push-notifications-helper';
import PushNotificationsProcessor from './push-notifications-processor';
import {isAndroidPlatform} from 'util/util';

import type {StorageState} from 'components/storage/storage';
import type {Token} from 'types/Notification';

async function getDeviceToken(): Promise<Token> {
  let deviceToken: Token = null;

  try {
    deviceToken = await PushNotificationsProcessor.getDeviceToken();
  } catch (e) {
    log.warn(
      `${PNHelper.logPrefix}cannot retrieve device token from the phone`,
      e,
    );
  }

  return deviceToken;
}

async function doSubscribe(
  youtrackToken: string,
  deviceToken: string,
): Promise<void> {
  try {
    await PNHelper.subscribe(deviceToken, youtrackToken);

    if (isAndroidPlatform()) {
      showSuccessMessage();
    }

    PNHelper.storeDeviceToken(deviceToken);
  } catch (error) {
    PNHelper.storeDeviceToken(null);
    log.warn(`${PNHelper.logPrefix}failed to subscribe`, error);
  }

  function showSuccessMessage(): void {
    if (!PNHelper.getStoredDeviceToken()) {
      PNHelper.showInfoMessage(
        'You are subscribed to push notifications',
        'Make sure that the following application notifications options in your device settings are allowed:\n• Show\n• Sound\n• Vibration\n• LED light\n',
      );
    }
  }
}

async function register(): Promise<void> {
  const deviceToken: Token = await getDeviceToken();
  const errorMsg: string = 'Subscription to push notifications failed.';

  if (deviceToken) {
    const youtrackToken: Token = await PNHelper.loadYouTrackToken();

    if (youtrackToken) {
      await doSubscribe(youtrackToken, deviceToken);
    } else {
      log.warn(errorMsg);
      throw new Error([errorMsg, ':YT token'].join(''));
    }
  } else {
    throw new Error([errorMsg, ':device token'].join(''));
  }
}

async function unregister(): Promise<void> {
  PNHelper.storeDeviceToken(null);
  const deviceToken: Token = await getDeviceToken();

  if (deviceToken) {
    return await PNHelper.unsubscribe(deviceToken);
  }
}

async function initialize(
  onSwitchAccount: (account: StorageState, issueId?: string, articleId?: string) => any,
): Promise<void> {
  const deviceToken: Token = await getDeviceToken();

  if (PNHelper.isDeviceTokenChanged(deviceToken)) {
    log.info(
      `'${PNHelper.logPrefix}'(initialize): device token has changed, re-subscribe`,
    );

    try {
      PushNotificationsProcessor.init();
      await register();
    } catch (e) {
      const message: string =
        'Re-subscription to push notifications after a device token has been changed failed.';
      log.warn(message);
      throw new Error(message);
    }
  }

  PushNotificationsProcessor.subscribeOnNotificationOpen(onSwitchAccount);
}

export default {
  register,
  unregister,
  initialize,
};
