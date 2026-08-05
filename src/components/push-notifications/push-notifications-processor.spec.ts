import PushNotificationsProcessor from './push-notifications-processor';
import helper from './push-notifications-helper';
import {navigateToRouteById} from 'components/router/router-helper';
import {isAndroidPlatform} from 'util/util';
import {mockEventsRegistry} from '../../../test/jest-mock__react-native-notifications';

import {Notifications} from 'react-native-notifications';

import type {Notification} from 'react-native-notifications';

jest.mock('util/util', () => ({
  ...jest.requireActual('util/util'),
  isAndroidPlatform: jest.fn(() => true),
}));
jest.mock('components/router/router-helper', () => ({
  navigateToRouteById: jest.fn(),
}));
jest.mock('actions/app-actions-helper', () => ({
  targetAccountToSwitchTo: jest.fn().mockResolvedValue(null),
}));
jest.mock('components/storage/storage', () => ({
  ...jest.requireActual('components/storage/storage'),
  getStorageState: jest.fn(() => ({config: {backendUrl: 'https://example.com'}})),
}));

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

    const captureForegroundHandler = (): ((n: Notification, c: () => void) => void) => {
      let handler: (n: Notification, c: () => void) => void = () => {};
      // The default mock does not invoke the registered callback, so capture it and
      // drive it manually. Reassign the property directly instead of `jest.spyOn`:
      // the mock shares one function reference across the foreground/background/open
      // registrations, so spying corrupts which callback is captured.
      const original = mockEventsRegistry.registerNotificationReceivedForeground;
      (mockEventsRegistry as any).registerNotificationReceivedForeground = jest.fn(
        (cb: any) => {
          handler = cb;
          return {remove: jest.fn()};
        },
      );
      PushNotificationsProcessor.init();
      (mockEventsRegistry as any).registerNotificationReceivedForeground = original;
      return handler;
    };

    it('should re-post a foreground notification as a local one on Android so it stays visible', () => {
      (isAndroidPlatform as jest.Mock).mockReturnValue(true);

      captureForegroundHandler()(mockEventsRegistry.notificationMock as Notification, jest.fn());

      expect(Notifications.postLocalNotification).toHaveBeenCalledWith(
        mockEventsRegistry.payloadMock,
      );
    });

    it('should not re-post a foreground notification on iOS (presented natively)', () => {
      (isAndroidPlatform as jest.Mock).mockReturnValue(false);

      captureForegroundHandler()(mockEventsRegistry.notificationMock as Notification, jest.fn());

      expect(Notifications.postLocalNotification).not.toHaveBeenCalled();
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


  describe('subscribeOnNotificationOpen', () => {
    const notificationMock = {} as Notification;
    let openHandler: (n: Notification, completion: () => void) => Promise<void>;

    beforeEach(() => {
      PushNotificationsProcessor.registerNotificationOpenListener = null;
      PushNotificationsProcessor.lastNotificationNavigationAt = 0;

      jest.spyOn(helper, 'getIssueId').mockReturnValue('BS-3956');
      jest.spyOn(helper, 'getArticleId').mockReturnValue(undefined);
      jest.spyOn(helper, 'getBackendURL').mockReturnValue('');
      jest.spyOn(helper, 'getActivityId').mockReturnValue(undefined);

      // Capture the handler instead of letting the default mock auto-invoke it.
      jest
        .spyOn(mockEventsRegistry, 'registerNotificationOpened')
        .mockImplementation((cb: any) => {
          openHandler = cb;
          return {remove: jest.fn()} as any;
        });

      PushNotificationsProcessor.subscribeOnNotificationOpen(jest.fn());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should navigate to the tapped entity', async () => {
      await openHandler(notificationMock, jest.fn());

      expect(navigateToRouteById).toHaveBeenCalledWith('BS-3956', undefined, undefined);
    });

    it('should mark that a notification navigation just happened, so bootstrap does not reset over it', async () => {
      await openHandler(notificationMock, jest.fn());

      expect(
        PushNotificationsProcessor.hadRecentNotificationNavigation(),
      ).toBe(true);
    });
  });
});
