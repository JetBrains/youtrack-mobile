//TODO: Dirty solution, since in-place jest.mock() doesn't work. This is required a further investigation
//TODO: this stuff should be placed inside a particular file related to precessing push notifications

const deviceTokenMock = 'deviceTokenMock-XXX';
const errorMock = new Error('Registration error');
const payloadMock = {issueId: 'issueIdMock', userId: 'userIdMock'};
const notificationMock = {payload: payloadMock};

const onNotificationMock = jest.fn(
  (notification = notificationMock, completion = jest.fn()) => completion()
);

export const mockEventsRegistry = {
  deviceTokenMock: deviceTokenMock,
  errorMock: errorMock,

  payloadMock: payloadMock,
  notificationMock: notificationMock,

  registerRemoteNotificationsRegistered: jest.fn((callback) => callback({deviceToken: deviceTokenMock})),
  registerRemoteNotificationsRegistrationFailed: jest.fn((callback) => callback(errorMock)),

  registerNotificationReceivedForeground: onNotificationMock,
  registerNotificationReceivedBackground: onNotificationMock,
  registerNotificationOpened: onNotificationMock,
};

const mockReactNativeNotification = () => {
  jest.mock('react-native-notifications', () => {
    return {
      Notifications: {
        getInitialNotification: jest.fn().mockReturnValue(Promise.resolve()),
        registerRemoteNotifications: jest.fn(),
        events: () => mockEventsRegistry,
      },
    };
  });
};

export {
  mockReactNativeNotification,
};
