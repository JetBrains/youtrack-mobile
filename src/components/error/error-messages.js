/* @flow */

export const REGISTRATION_ERRORS = [
  'Not implemented',
  'remote notifications are not supported in the simulator',
  'YouTrack does not support push notifications',
];

export const UNSUPPORTED_ERRORS = {
  NOT_IMPLEMENTED: 'Not implemented',
  REMOTE_NOTIFICATIONS_SIMULATOR_NOT_SUPPORTED: 'remote notifications are not supported in the simulator',
  PUSH_NOTIFICATION_NOT_SUPPORTED: 'YouTrack does not support push notifications',
};

export const CUSTOM_ERROR_MESSAGE = {
  PUSH_NOTIFICATION_REGISTRATION: 'Push notifications registration failed',
  NOT_SUPPORTED: 'Push notification is not supported: ',
  PUSH_NOTIFICATION_IS_NOT_SUPPORTED: 'Push notification is not supported: ',
  NO_ENTITY_FOUND: 'Can\'t find entity with id',
  BAD_REQUEST: 'Bad Request',
};

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong';
