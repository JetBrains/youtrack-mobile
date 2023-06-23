import PushNotificationsProcessor from './push-notifications-processor';
import {mockEventsRegistry} from '../../../test/jest-mock__react-native-notifications';

describe('Android', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should define class interface', () => {
    expect(PushNotificationsProcessor.getDeviceToken).toBeDefined();
    expect(PushNotificationsProcessor.setDeviceToken).toBeDefined();
    expect(
      PushNotificationsProcessor.subscribeOnNotificationOpen,
    ).toBeDefined();
    expect(PushNotificationsProcessor.unsubscribe).toBeDefined();
    expect(PushNotificationsProcessor.init).toBeDefined();
    expect(PushNotificationsProcessor.deviceTokenPromise).toBeDefined();
  });


  describe('Subscription', () => {
    it('should return null device token', async () => {
      expect(PushNotificationsProcessor.deviceToken).toEqual(null);
    });

    it('should initialize a subscription', async () => {
      PushNotificationsProcessor.init();

      expect(
        mockEventsRegistry.registerRemoteNotificationsRegistered,
      ).toHaveBeenCalled();
      expect(
        mockEventsRegistry.registerRemoteNotificationsRegistrationFailed,
      ).toHaveBeenCalled();
      expect(
        mockEventsRegistry.registerNotificationReceivedForeground,
      ).toHaveBeenCalled();
      expect(
        mockEventsRegistry.registerNotificationReceivedBackground,
      ).toHaveBeenCalled();
      expect(mockEventsRegistry.registerNotificationOpened).toHaveBeenCalled();
    });

    it('should set device token', () => {
      jest.spyOn(PushNotificationsProcessor, 'setDeviceToken');
      PushNotificationsProcessor.init();

      expect(PushNotificationsProcessor.setDeviceToken).toHaveBeenCalledWith(
        mockEventsRegistry.deviceTokenMock,
      );
    });

    it('should return resolved device token promise', async () => {
      jest.spyOn(PushNotificationsProcessor, 'setDeviceToken');
      PushNotificationsProcessor.init();

      expect(PushNotificationsProcessor.deviceToken).toEqual(
        mockEventsRegistry.deviceTokenMock,
      );
    });
  });
});
