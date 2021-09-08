/* @flow */

import PushNotification from 'react-native-push-notification';
import PushNotificationsProcessor from './push-notifications-processor.ios';


describe('IOS', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should define class interface', () => {
    expect(PushNotificationsProcessor.getDeviceToken).toBeDefined();
    expect(PushNotificationsProcessor.setDeviceToken).toBeDefined();
    expect(PushNotificationsProcessor.subscribeOnNotificationOpen).toBeDefined();
    expect(PushNotificationsProcessor.unsubscribe).toBeDefined();
    expect(PushNotificationsProcessor.init).toBeDefined();
    expect(PushNotificationsProcessor.deviceTokenPromise).toBeDefined();
  });


  describe('Subscription', () => {
    it('should return NULL device token', async () => {
      expect(PushNotificationsProcessor.deviceToken).toEqual(null);
    });

    it('should initialize a subscription', async () => {
      PushNotificationsProcessor.init();

      expect(PushNotification.configure).toHaveBeenCalled();

    });
  });

});
