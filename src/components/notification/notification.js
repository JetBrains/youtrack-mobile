/* @flow */

import log from '../log/log';
import showNotification from './notification_show';
import {resolveErrorMessage} from '../error/error-resolver';

const NOTIFY_DURATION: number = 3000;
let toastComponentRef: any;

const showErrorMessage = function (message: string, error?: ?Object, duration?: number) {
  log.warn(message, error);
  showNotification(message, null, toastComponentRef, duration);
};

export function notifyError(err: Object, duration: number = NOTIFY_DURATION * 2): void {
  resolveErrorMessage(err, true).then(
    (errorMessage: string) => showErrorMessage(errorMessage, err, duration)
  );
}

export function notify(message: string, duration: number = NOTIFY_DURATION): void {
  showErrorMessage(message, null, duration);
}

export function setNotificationComponent(reference: any) {
  toastComponentRef = reference;
}
