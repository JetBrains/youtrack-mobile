import * as API from '../api/api__instance';
import * as storage from '../storage/storage';
import * as util from '../../util/util';
import helper from './push-notifications-helper';
import {categoryName} from '../activity/activity__category';
import {mockEventsRegistry} from '../../../test/jest-mock__react-native-notifications';
import {UNSUPPORTED_ERRORS} from '../error/error-messages';


describe('push-notifications-helper', () => {
  const youTrackTokenMock: string = 'youTrackTokenMock';
  const successResponseMock: string = 'OK';
  const errorMock = new Error('Subscription error');
  let apiMock;

  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = {
      getNotificationsToken: jest.fn(),
      subscribeToFCMNotifications: jest.fn(),
      subscribeToIOSNotifications: jest.fn(),
      unsubscribeFromFCMNotifications: jest.fn(),
      unsubscribeFromIOSNotifications: jest.fn(),
    };
    jest.spyOn(API, 'getApi').mockReturnValue(apiMock);
    jest.spyOn(util, 'isAndroidPlatform');
  });

  describe('loadYouTrackToken', () => {
    it('should return a YouTrack subscription token', async () => {
      apiMock.getNotificationsToken.mockResolvedValueOnce(youTrackTokenMock);

      await expect(helper.loadYouTrackToken()).resolves.toEqual(youTrackTokenMock);
    });

    it('should not return a YouTrack subscription token', async () => {
      apiMock.getNotificationsToken.mockRejectedValueOnce(errorMock);

      await expect(helper.loadYouTrackToken()).resolves.toEqual(null);
    });
  });


  describe('Subscribe', () => {
    describe('Success subscription', () => {
      it('should subscribe Android', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(true);
        apiMock.subscribeToFCMNotifications.mockResolvedValueOnce(successResponseMock);

        await expect(doSubscribe()).resolves.toEqual(successResponseMock);
        expect(apiMock.subscribeToFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock
        );
      });

      it('should subscribe IOS', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(false);
        apiMock.subscribeToIOSNotifications.mockResolvedValueOnce(successResponseMock);

        await expect(doSubscribe()).resolves.toEqual(successResponseMock);
        expect(apiMock.subscribeToIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock
        );
      });
    });

    describe('Subscription error', () => {
      it('should NOT subscribe Android', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(true);
        apiMock.subscribeToFCMNotifications.mockRejectedValueOnce(errorMock);

        await expect(doSubscribe()).rejects.toEqual(errorMock);
        expect(apiMock.subscribeToFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock
        );
      });

      it('should NOT subscribe IOS', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(false);
        apiMock.subscribeToIOSNotifications.mockRejectedValueOnce(errorMock);

        await expect(doSubscribe()).rejects.toEqual(errorMock);
        expect(apiMock.subscribeToIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          youTrackTokenMock,
          mockEventsRegistry.deviceTokenMock
        );
      });
    });

    function doSubscribe() {
      return helper.subscribe(mockEventsRegistry.deviceTokenMock, youTrackTokenMock);
    }
  });


  describe('Unsubscribe', () => {
    describe('Success unsubscription', () => {
      it('should unsubscribe Android', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(true);
        apiMock.unsubscribeFromFCMNotifications.mockResolvedValueOnce(successResponseMock);

        expect(await doUnsubscribe()).toEqual(successResponseMock);
        expect(apiMock.unsubscribeFromFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock
        );
      });

      it('should unsubscribe IOS', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(false);
        apiMock.unsubscribeFromIOSNotifications.mockResolvedValueOnce(successResponseMock);

        expect(await doUnsubscribe()).toEqual(successResponseMock);
        expect(apiMock.unsubscribeFromIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock
        );
      });
    });


    describe('Error unsubscription', () => {
      it('should not unsubscribe Android', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(true);
        apiMock.unsubscribeFromFCMNotifications.mockRejectedValueOnce(errorMock);

        expect(await doUnsubscribe()).toEqual(null);
        expect(apiMock.unsubscribeFromFCMNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock
        );
      });

      it('should not unsubscribe IOS', async () => {
        util.isAndroidPlatform.mockReturnValueOnce(false);
        apiMock.unsubscribeFromIOSNotifications.mockRejectedValueOnce(errorMock);

        expect(await doUnsubscribe()).toEqual(null);
        expect(apiMock.unsubscribeFromIOSNotifications).toHaveBeenCalledWith(
          helper.KONNECTOR_URL,
          mockEventsRegistry.deviceTokenMock
        );
      });
    });

    async function doUnsubscribe() {
      return await helper.unsubscribe(mockEventsRegistry.deviceTokenMock);
    }
  });


  describe('getIssueId', () => {
    it('should return iOS push notification issue id', () => {
      expect(helper.getIssueId({ytIssueId: youTrackTokenMock})).toEqual(youTrackTokenMock);
    });

    it('should return iOS push notification data issue id', () => {
      expect(helper.getIssueId({data: {ytIssueId: youTrackTokenMock}})).toEqual(youTrackTokenMock);
    });

    it('should return Android push notification issue id', () => {
      expect(helper.getIssueId({issueId: youTrackTokenMock})).toEqual(youTrackTokenMock);
    });

    it('should return Android push notification data issue id', () => {
      expect(helper.getIssueId({data: {issueId: youTrackTokenMock}})).toEqual(youTrackTokenMock);
    });
  });


  describe('composeError', () => {
    let err;
    beforeEach(() => {
      err = new Error('Error');
    });

    it('should return unsupported error with 400 response', () => {
      err.status = 400;

      expect(helper.composeError(err).message).toEqual(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
    });

    it('should return unsupported error with 404 response', () => {
      err.status = 404;

      expect(helper.composeError(err).message).toEqual(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
    });

    it('should return unsupported error with 405 response', () => {
      err.status = 405;

      expect(helper.composeError(err).message).toEqual(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
    });

    it('should not return unsupported error', () => {
      err.status = 403;

      expect(helper.composeError(err).message).not.toEqual(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
    });

  });


  describe('isDeviceTokenChanged', () => {
    it('should return TRUE', () => {
      storage.__setStorageState({deviceToken: 'a'});

      expect(helper.isDeviceTokenChanged('b')).toEqual(true);
    });

    it('should return FALSE', () => {
      storage.__setStorageState({deviceToken: 'a'});

      expect(helper.isDeviceTokenChanged('a')).toEqual(false);
    });
  });

  describe('storeDeviceToken', () => {
    it('should safe in the async storage', () => {
      jest.spyOn(storage, 'flushStoragePart');
      helper.storeDeviceToken(mockEventsRegistry.deviceTokenMock);

      expect(storage.flushStoragePart).toHaveBeenCalledWith({deviceToken: mockEventsRegistry.deviceTokenMock});
    });
  });


  describe('getStoredDeviceToken', () => {
    it('should get a device token from the async storage', () => {
      jest.spyOn(storage, 'getStorageState');
      storage.__setStorageState({deviceToken: mockEventsRegistry.deviceTokenMock});

      expect(helper.getStoredDeviceToken()).toEqual(mockEventsRegistry.deviceTokenMock);
    });
  });


  describe('isSummaryOrDescriptionNotification', () => {
    it('should return FALSE if no `data` or `payload` provided', () => {
      expect(helper.isSummaryOrDescriptionNotification()).toEqual(false);
    });

    it('should return FALSE if there is no any category', () => {
      expect(helper.isSummaryOrDescriptionNotification({})).toEqual(false);
    });

    it('should return FALSE if it is not summary or description category', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: categoryName.CUSTOM_FIELD,
      })).toEqual(false);
    });

    it('should return TRUE if it is a summary category', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: categoryName.SUMMARY,
      })).toEqual(true);
    });

    it('should return TRUE if it is a description category', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: categoryName.DESCRIPTION,
      })).toEqual(true);
    });

    it('should return TRUE if the first category is a description one', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: `${categoryName.DESCRIPTION},${categoryName.CUSTOM_FIELD}`,
      })).toEqual(true);
    });

    it('should return TRUE if the first category is a summary one', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: `${categoryName.SUMMARY},${categoryName.CUSTOM_FIELD}`,
      })).toEqual(true);
    });

    it('should return FALSE if the first category is not a description or summary', () => {
      expect(helper.isSummaryOrDescriptionNotification({
        categories: `${categoryName.CUSTOM_FIELD},${categoryName.DESCRIPTION},${categoryName.LINKS}`,
      })).toEqual(false);
    });


  });
});
