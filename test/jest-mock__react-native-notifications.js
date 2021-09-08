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

const mockReactNativeIOSNotification = () => {
  jest.mock('@react-native-community/push-notification-ios', () => {
    return {
      addEventListener: jest.fn().mockReturnValue((callback) => callback(mockEventsRegistry.deviceTokenMock)),
      removeEventListener: jest.fn(),
      requestPermissions: jest.fn().mockResolvedValue(true),
    };
  });
};


const mockReactNativePushNotification = () => {
  jest.mock('react-native-push-notification', () => {
    return {
      configure: jest.fn(),
      onRegister: jest.fn(),
      onNotification: jest.fn(),
      addEventListener: jest.fn(),
      requestPermissions: jest.fn(),
    };
  });
};


export {
  mockReactNativeNotification,
  mockReactNativeIOSNotification,
  mockReactNativePushNotification,
};
