export const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';


export const UNSUPPORTED_ERRORS = {
  NOT_IMPLEMENTED: 'Not implemented',
  REMOTE_NOTIFICATIONS_SIMULATOR_NOT_SUPPORTED: 'remote notifications are not supported in the simulator',
  PUSH_NOTIFICATION_NOT_SUPPORTED: 'YouTrack does not support push notifications'
};

export const CUSTOM_ERROR_MESSAGE = {
  FAIL: 'Push notifications registration failed',
  NOT_SUPPORTED: 'Push notification is not supported: ',
  PUSH_NOTIFICATION_IS_NOT_SUPPORTED: 'Push notification is not supported: '
};

export const REGISTRATION_ERRORS = [
  'Not implemented',
  'remote notifications are not supported in the simulator',
  'YouTrack does not support push notifications'
];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  SUCCESS: 200,
  REDIRECT: 300,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  GATEWAY_TIMEOUT: 504
};
