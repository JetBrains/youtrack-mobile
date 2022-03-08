/* @flow */

import {i18n} from '../i18n/i18n';

const notImplementedText: string = i18n('Not implemented');
const doesNotSupportPushNotificationsText = i18n('YouTrack does not support push notifications');

const remoteNotificationsAreNotSupportedInTheSimulator = i18n('remote notifications are not supported in the simulator');
export const REGISTRATION_ERRORS = [
  notImplementedText,
  remoteNotificationsAreNotSupportedInTheSimulator,
  doesNotSupportPushNotificationsText,
];

export const UNSUPPORTED_ERRORS = {
  NOT_IMPLEMENTED: notImplementedText,
  REMOTE_NOTIFICATIONS_SIMULATOR_NOT_SUPPORTED: remoteNotificationsAreNotSupportedInTheSimulator,
  PUSH_NOTIFICATION_NOT_SUPPORTED: doesNotSupportPushNotificationsText,
};

export const CUSTOM_ERROR_MESSAGE = {
  PUSH_NOTIFICATION_REGISTRATION: i18n('Push notifications registration failed'),
  NOT_SUPPORTED: i18n('Push notification is not supported: '),
  PUSH_NOTIFICATION_IS_NOT_SUPPORTED: i18n('Push notification is not supported: '),
  NO_ENTITY_FOUND: i18n('Can\'t find entity with id'),
  BAD_REQUEST: i18n('Bad Request'),
  NO_COMMAND_SUGGESTIONS: i18n('Failed to load command suggestions'),
  APPLY_COMMAND_FAILED: i18n('Failed to apply a command'),
};

export const DEFAULT_ERROR_MESSAGE = i18n('Something went wrong');
