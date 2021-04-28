/* @flow */

import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';
import {extractErrorMessage, resolveError} from '../error/error-resolver';

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

export function notify(message: string, error?: Object, duration: number = NOTIFY_DURATION): any {
  if (error) {
    log.warn(message, error);
  }
  return showNotification(message, null, toastComponentRef, duration);
}

export function setNotificationComponent(reference: Object) {
  toastComponentRef = reference;
}
