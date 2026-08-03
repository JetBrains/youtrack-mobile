import PushNotifications from './push-notifications';
import PNHelper from './push-notifications-helper';
import PushNotificationsProcessor from './push-notifications-processor';

const userLogin = 'user-login';
const liveTokenMock = 'live-device-token-mock';
const storedTokenMock = 'stored-device-token-mock';

describe('push-notifications', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(PNHelper, 'unsubscribe').mockResolvedValue(null);
    jest.spyOn(PNHelper, 'storeDeviceToken').mockResolvedValue(undefined);
  });

  describe('unregister', () => {
    it('should unsubscribe using the live device token when it is available', async () => {
      jest
        .spyOn(PushNotificationsProcessor, 'getDeviceToken')
        .mockResolvedValue(liveTokenMock);
      jest.spyOn(PNHelper, 'getStoredDeviceToken').mockReturnValue(storedTokenMock);

      await PushNotifications.unregister(userLogin);

      expect(PNHelper.unsubscribe).toHaveBeenCalledWith(liveTokenMock, userLogin);
      expect(PNHelper.storeDeviceToken).toHaveBeenCalledWith(null);
    });

    it('should fall back to the stored device token when the live token promise is unresolved (e.g. after an app restart)', async () => {
      jest
        .spyOn(PushNotificationsProcessor, 'getDeviceToken')
        .mockResolvedValue(null);
      jest.spyOn(PNHelper, 'getStoredDeviceToken').mockReturnValue(storedTokenMock);

      await PushNotifications.unregister(userLogin);

      expect(PNHelper.unsubscribe).toHaveBeenCalledWith(storedTokenMock, userLogin);
      expect(PNHelper.storeDeviceToken).toHaveBeenCalledWith(null);
    });

    it('should not unsubscribe when no device token is available', async () => {
      jest
        .spyOn(PushNotificationsProcessor, 'getDeviceToken')
        .mockResolvedValue(null);
      jest.spyOn(PNHelper, 'getStoredDeviceToken').mockReturnValue(null);

      await PushNotifications.unregister(userLogin);

      expect(PNHelper.unsubscribe).not.toHaveBeenCalled();
      expect(PNHelper.storeDeviceToken).not.toHaveBeenCalled();
    });
  });
});
