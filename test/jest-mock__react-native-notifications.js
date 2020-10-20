//TODO: Dirty solution, since in-place jest.mock() doesn't work. This is required a further investigation
//TODO: this stuff should be placed inside a particular file related to precessing push notifications

const deviceTokenMock = 'deviceTokenMock-XXX';
const errorMock = new Error('Registration error');
const payloadMock = {issueId: 'issueIdMock', userId: 'userIdMock'};
const notificationMock = {payload: payloadMock};

const onNotificationMock = jest.fn(
  (notification = notificationMock, completion = jest.fn()) => completion()
);
export const eventsRegistryMock = {
  deviceTokenMock: deviceTokenMock,
  errorMock: errorMock,

  payloadMock: payloadMock,
  notificationMock: notificationMock,

  registerRemoteNotificationsRegistered: jest.fn((callback) => callback(deviceTokenMock)),
  registerRemoteNotificationsRegistrationFailed: jest.fn((callback) => callback(errorMock)),

  registerNotificationReceivedForeground: onNotificationMock,
  registerNotificationReceivedBackground: onNotificationMock,
  registerNotificationOpened: onNotificationMock,
};

export default function mockReactNativeNotification() {
  jest.mock('react-native-notifications', () => ({
    addEventListener: jest.fn(),
    requestPermissions: jest.fn(),
    consumeBackgroundQueue: jest.fn(),
  }));


  jest.mock('react-native-notifications-latest', () => {
    return {
      Notifications: {
        getInitialNotification: jest.fn().mockReturnValue(Promise.resolve()),
        registerRemoteNotifications: jest.fn(),
        events: () => eventsRegistryMock
      }
    };
  });
}
