/* @flow */

import appPackage from '../../../package.json'; // eslint-disable-line import/extensions

import PushNotificationsProcessor from './push-notifications-processor';

import {eventsRegistryMock} from '../../../test/jest-mock__react-native-notifications';

import type API from '../api/api';


describe('PushNotificationsProcessor', () => {

  it('should have Konnector URL', () => {
    expect(PushNotificationsProcessor.KONNECTOR_URL).toEqual(appPackage.config.KONNECTOR_URL);
  });


  describe('Native subscription', () => {
    let onSuccessMock: () => any;
    let onErrorMock: () => any;

    beforeEach(() => {
      onSuccessMock = jest.fn();
      onErrorMock = jest.fn();
    });

    it('should subscribe to registration success event', () => {
      PushNotificationsProcessor.init(onSuccessMock, onErrorMock);

      expect(eventsRegistryMock.registerRemoteNotificationsRegistered).toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalled();
    });

    it('should subscribe to registration fail event', () => {
      PushNotificationsProcessor.init(onSuccessMock, onErrorMock);

      expect(eventsRegistryMock.registerRemoteNotificationsRegistrationFailed).toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(eventsRegistryMock.errorMock);
    });

    it('should register notification events', () => {
      PushNotificationsProcessor.init(onSuccessMock, onErrorMock);

      expect(eventsRegistryMock.registerNotificationReceivedForeground).toHaveBeenCalled();
      expect(eventsRegistryMock.registerNotificationReceivedBackground).toHaveBeenCalled();
      expect(eventsRegistryMock.registerNotificationOpened).toHaveBeenCalled();
    });
  });


  describe('YouTrack subscription', () => {
    let apiMock: $Shape<API>;
    const youTrackTokenMock: string = 'youTrackTokenMock';
    const subscriptionSuccessResultMock: string = 'OK';
    const tokenSubscriptionErrorMock = new Error('YouTrack issue token subscription error');

    beforeEach(() => {
      apiMock = {
        getNotificationsToken: jest.fn().mockResolvedValue(youTrackTokenMock),
        subscribeToFCMNotifications: jest.fn().mockResolvedValue(subscriptionSuccessResultMock),
      };
    });


    describe('getYouTrackToken', () => {
      it('should receive a YouTrack subscription token', async () => {
        await expect(PushNotificationsProcessor.getYouTrackToken(apiMock)).resolves.toEqual(youTrackTokenMock);
      });

      it('should not receive a YouTrack subscription token', async () => {
        apiMock.getNotificationsToken.mockImplementationOnce(() => {throw tokenSubscriptionErrorMock;});

        await expect(
          PushNotificationsProcessor.getYouTrackToken(apiMock)
        ).rejects.toEqual(tokenSubscriptionErrorMock);
      });
    });


    describe('subscribe', () => {
      it('should receive a YouTrack token first', async () => {
        await PushNotificationsProcessor.subscribe(apiMock, eventsRegistryMock.deviceTokenMock);

        expect(apiMock.getNotificationsToken).toHaveBeenCalled();
      });

      it('should subscribe in YouTrack', async () => {
        await PushNotificationsProcessor.subscribe(apiMock, eventsRegistryMock.deviceTokenMock);

        expect(apiMock.subscribeToFCMNotifications).toHaveBeenCalledWith(
          PushNotificationsProcessor.KONNECTOR_URL,
          youTrackTokenMock,
          eventsRegistryMock.deviceTokenMock
        );
      });

      it('should not subscribe if YouTrack fails to issue a subscription token', async () => {
        apiMock.getNotificationsToken.mockImplementationOnce(() => {throw tokenSubscriptionErrorMock;});

        await expect(
          PushNotificationsProcessor.subscribe(apiMock, eventsRegistryMock.deviceTokenMock)
        ).rejects.toEqual(tokenSubscriptionErrorMock);

      });

      it('should not subscribe if Konnector failed to subscribe', async () => {
        const subscriptionErrorMock = new Error('Failed to subscribe to FCM');
        apiMock.subscribeToFCMNotifications.mockImplementationOnce(() => {throw subscriptionErrorMock;});

        await expect(
          PushNotificationsProcessor.subscribe(apiMock, eventsRegistryMock.deviceTokenMock)
        ).rejects.toEqual(subscriptionErrorMock);
      });
    });
  });

});
