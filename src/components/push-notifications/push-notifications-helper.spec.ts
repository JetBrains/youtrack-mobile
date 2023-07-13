import * as API from '../api/api__instance';
import * as storage from '../storage/storage';
import * as util from 'util/util';
import helper from './push-notifications-helper';
import {categoryName} from '../activity/activity__category';
import {mockEventsRegistry} from '../../../test/jest-mock__react-native-notifications';


describe('push-notifications-helper', () => {
  const youTrackTokenMock: string = 'youTrackTokenMock';
  const successResponseMock: string = 'OK';
  const errorMock = new Error('Subscription error');
  let apiMock: Record<string, jest.Mock>;
  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = {
      getNotificationsToken: jest.fn(),
      subscribeToFCMNotifications: jest.fn(),
      subscribeToIOSNotifications: jest.fn(),
      unsubscribeFromFCMNotifications: jest.fn(),
      unsubscribeFromIOSNotifications: jest.fn(),
    };
    jest.spyOn(API, 'getApi').mockReturnValue(apiMock as any);
    jest.spyOn(util, 'isAndroidPlatform');
  });


  describe('loadYouTrackToken', () => {
    it('should return a YouTrack subscription token', async () => {
      apiMock.getNotificationsToken.mockResolvedValueOnce(youTrackTokenMock);
      await expect(helper.loadYouTrackToken()).resolves.toEqual(
        youTrackTokenMock,
      );
    });
    it('should not return a YouTrack subscription token', async () => {
      apiMock.getNotificationsToken.mockRejectedValueOnce(errorMock);
      await expect(helper.loadYouTrackToken()).resolves.toEqual(null);
    });
  });


  describe('Subscribe', () => {

    describe('Success subscription', () => {
      it('should subscribe Android', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(true);
        apiMock.subscribeToFCMNotifications.mockResolvedValueOnce(
          successResponseMock,
        );
        await expect(doSubscribe()).resolves.toEqual(successResponseMock);
        expect(apiMock.subscribeToFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock,
        );
      });
      it('should subscribe IOS', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(false);
        apiMock.subscribeToIOSNotifications.mockResolvedValueOnce(
          successResponseMock,
        );
        await expect(doSubscribe()).resolves.toEqual(successResponseMock);
        expect(apiMock.subscribeToIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock,
        );
      });
    });


    describe('Subscription error', () => {
      it('should NOT subscribe Android', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(true);
        apiMock.subscribeToFCMNotifications.mockRejectedValueOnce(errorMock);
        await expect(doSubscribe()).rejects.toEqual(errorMock);
        expect(apiMock.subscribeToFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock,
        );
      });
      it('should NOT subscribe IOS', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(false);
        apiMock.subscribeToIOSNotifications.mockRejectedValueOnce(errorMock);
        await expect(doSubscribe()).rejects.toEqual(errorMock);
        expect(apiMock.subscribeToIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock,
        );
      });
    });

    function doSubscribe() {
      return helper.subscribe(
        mockEventsRegistry.deviceTokenMock,
        youTrackTokenMock,
      );
    }
  });
  describe('Unsubscribe', () => {
    describe('Success unsubscription', () => {
      it('should unsubscribe Android', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(true);
        apiMock.unsubscribeFromFCMNotifications.mockResolvedValueOnce(
          successResponseMock,
        );
        expect(await doUnsubscribe()).toEqual(successResponseMock);
        expect(apiMock.unsubscribeFromFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock,
        );
      });
      it('should unsubscribe IOS', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(false);
        apiMock.unsubscribeFromIOSNotifications.mockResolvedValueOnce(
          successResponseMock,
        );
        expect(await doUnsubscribe()).toEqual(successResponseMock);
        expect(apiMock.unsubscribeFromIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock,
        );
      });
    });


    describe('Error unsubscription', () => {
      it('should not unsubscribe Android', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(true);
        apiMock.unsubscribeFromFCMNotifications.mockRejectedValueOnce(
          errorMock,
        );
        expect(await doUnsubscribe()).toEqual(null);
        expect(apiMock.unsubscribeFromFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock,
        );
      });
      it('should not unsubscribe IOS', async () => {
        (util.isAndroidPlatform as jest.Mock).mockReturnValueOnce(false);
        apiMock.unsubscribeFromIOSNotifications.mockRejectedValueOnce(
          errorMock,
        );
        expect(await doUnsubscribe()).toEqual(null);
        expect(apiMock.unsubscribeFromIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock,
        );
      });
    });

    async function doUnsubscribe() {
      return await helper.unsubscribe(mockEventsRegistry.deviceTokenMock);
    }
  });


  describe('getIssueId', () => {
    it('should return iOS push notification issue id', () => {
      expect(
        helper.getIssueId({
          ytIssueId: 'X-1',
        } as any),
      ).toEqual('X-1');
    });
    it('should return iOS push notification data issue id', () => {
      expect(
        helper.getIssueId({
          data: {
            ytIssueId: 'X-2',
          },
        } as any),
      ).toEqual('X-2');
    });
    it('should return iOS push notification issue id via PushNotificationIOS API', () => {
      expect(
        helper.getIssueId({
          getData: () => ({
            ytIssueId: 'X-3',
          }),
        } as any),
      ).toEqual('X-3');
    });

    it('should return Android push notification article id', () => {
      expect(
        helper.getArticleId({
          ytArticleId: 'X-4',
        } as any),
      ).toEqual('X-4');
    });
    it('should return Android push notification data article id', () => {
      expect(
        helper.getArticleId({
          data: {
            ytArticleId: 'X-5',
          },
        } as any),
      ).toEqual('X-5');
    });
  });


  describe('getBackendURL', () => {
    it('should return iOS push notification getBackendURL', () => {
      expect(
        helper.getBackendURL({
          backendUrl: 'https://1',
        } as any),
      ).toEqual('https://1');
    });
    it('should return iOS push notification data issue id', () => {
      expect(
        helper.getBackendURL({
          data: {
            backendUrl: 'https://2',
          },
        } as any),
      ).toEqual('https://2');
    });
    it('should return iOS push notification issue id via PushNotificationIOS API', () => {
      expect(
        helper.getBackendURL({
          getData: () => ({
            backendUrl: 'https://3',
          }),
        } as any),
      ).toEqual('https://3');
    });
    it('should return Android push notification issue id', () => {
      expect(
        helper.getBackendURL({
          backendUrl: 'https://4',
        } as any),
      ).toEqual('https://4');
    });
    it('should return Android push notification data issue id', () => {
      expect(
        helper.getBackendURL({
          data: {
            backendUrl: 'https://5',
          },
        } as any),
      ).toEqual('https://5');
    });
  });


  describe('isDeviceTokenChanged', () => {
    it('should return TRUE', () => {
      storage.__setStorageState({
        deviceToken: 'a',
      });

      expect(helper.isDeviceTokenChanged('b')).toEqual(true);
    });
    it('should return FALSE', () => {
      storage.__setStorageState({
        deviceToken: 'a',
      });

      expect(helper.isDeviceTokenChanged('a')).toEqual(false);
    });
  });


  describe('storeDeviceToken', () => {
    it('should safe in the async storage', () => {
      jest.spyOn(storage, 'flushStoragePart');
      helper.storeDeviceToken(mockEventsRegistry.deviceTokenMock);
      expect(storage.flushStoragePart).toHaveBeenCalledWith({
        deviceToken: mockEventsRegistry.deviceTokenMock,
      });
    });
  });


  describe('getStoredDeviceToken', () => {
    it('should get a device token from the async storage', () => {
      jest.spyOn(storage, 'getStorageState');

      storage.__setStorageState({
        deviceToken: mockEventsRegistry.deviceTokenMock,
      });

      expect(helper.getStoredDeviceToken()).toEqual(
        mockEventsRegistry.deviceTokenMock,
      );
    });
  });


  describe('isIssueDetailsNotification', () => {
    it('should return FALSE if no `data` or `payload` provided', () => {
      expect(helper.getActivityId()).toEqual(undefined);
    });
    it('should return `undefined` if there is no any category', () => {
      expect(helper.getActivityId({} as any)).toEqual(undefined);
    });
    it('should return first activity event id', () => {
      const eventIdMock: string = 'id1';
      expect(
        helper.getActivityId({
          categories: categoryName.CUSTOM_FIELD,
          eventIds: `${eventIdMock},id2`,
        }  as any),
      ).toEqual(eventIdMock);
    });

    it('should return second activity event id', () => {
      const eventIdMock: string = 'id2';
      expect(
        helper.getActivityId({
          categories: [categoryName.SUMMARY, categoryName.CUSTOM_FIELD, categoryName.CUSTOM_FIELD].join(','),
          eventIds: `id1,${eventIdMock},id3`,
        } as any),
      ).toEqual(eventIdMock);
    });

    it('should return `undefined` if it is a summary category', () => {
      expect(
        helper.getActivityId({
          categories: categoryName.SUMMARY,
        } as any),
      ).toEqual(undefined);
    });
    it('should return `undefined` if it is a description category', () => {
      expect(
        helper.getActivityId({
          categories: categoryName.DESCRIPTION,
        } as any),
      ).toEqual(undefined);
    });
    it('should return `undefined` if the first category is a description one', () => {
      expect(
        helper.getActivityId({
          categories: `${categoryName.DESCRIPTION},${categoryName.CUSTOM_FIELD}`,
        } as any),
      ).toEqual(undefined);
    });
    it('should return `undefined` if the first category is a summary one', () => {
      expect(
        helper.getActivityId({
          categories: `${categoryName.SUMMARY},${categoryName.CUSTOM_FIELD}`,
        } as any),
      ).toEqual(undefined);
    });
    it('should return `undefined` if the first category is a create issue category', () => {
      expect(
        helper.getActivityId({
          categories: `${categoryName.ISSUE_CREATED},${categoryName.LINKS}`,
        } as any),
      ).toEqual(undefined);
    });
    it('should return `undefined` if the first category is not a description or summary', () => {
      expect(
        helper.getActivityId({
          categories: `${categoryName.CUSTOM_FIELD},${categoryName.DESCRIPTION},${categoryName.LINKS}`,
        } as any),
      ).toEqual(undefined);
    });
  });
});
