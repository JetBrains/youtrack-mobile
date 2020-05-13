/* @flow */

import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';
import {extractErrorMessage, resolveError} from '../error-message/error-resolver';

const NOTIFY_DURATION = 3000;
let toastComponentRef: Object;

const showErrorMessage = function (message: string, error: Object) {
  log.warn(message, error);
  usage.trackError(error, message);
  showNotification(message, extractErrorMessage(error), toastComponentRef);
};

export function notifyError(message: string, err: Object): Promise<null> {
  return resolveError(err).then(extracted => showErrorMessage(message, extracted));
}

export function notify(message: string, multiplier?: number) {
  const duration: number = typeof multiplier === 'number' ? NOTIFY_DURATION * multiplier : NOTIFY_DURATION;
  return showNotification(message, null, toastComponentRef, duration);
}

export function setNotificationComponent(reference: Object) {
  toastComponentRef = reference;
}
