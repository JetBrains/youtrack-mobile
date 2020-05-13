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

export function notify(message: string, error?: Object) {
  if (error) {
    log.warn(message, error);
  }
  return showNotification(message, null, toastComponentRef, NOTIFY_DURATION);
}

export function setNotificationComponent(reference: Object) {
  toastComponentRef = reference;
}
