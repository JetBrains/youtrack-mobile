/* @flow */

import PushNotificationIOS from '@react-native-community/push-notification-ios';

import PushNotificationsProcessor from './push-notifications-processor.ios';
import {mockEventsRegistry} from '../../../test/jest-mock__react-native-notifications';


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

      const calls = PushNotificationIOS.addEventListener.mock.calls;
      expect(calls.length).toEqual(3);
      expect(calls[0][0]).toEqual('notification');
      expect(calls[1][0]).toEqual('register');
      expect(calls[2][0]).toEqual('registrationError');

      expect(PushNotificationIOS.requestPermissions).toHaveBeenCalled();

    });

    it('should set device token', () => {
      jest.spyOn(PushNotificationsProcessor, 'setDeviceToken');

      PushNotificationsProcessor.init();
      callRegistrationCallback(mockEventsRegistry.deviceTokenMock);

      expect(PushNotificationsProcessor.setDeviceToken).toHaveBeenCalledWith(mockEventsRegistry.deviceTokenMock);
    });

    it('should return resolved device token promise', async () => {
      PushNotificationsProcessor.init();
      callRegistrationCallback(mockEventsRegistry.deviceTokenMock);

      expect(PushNotificationsProcessor.deviceToken).toEqual(mockEventsRegistry.deviceTokenMock);
    });
  });


  function callRegistrationCallback(token) {
    return PushNotificationIOS.addEventListener.mock.calls[1][1].call(null, token);
  }
});
