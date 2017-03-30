/* @flow */
import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';

const NOTIFY_DURATION = 2000;
let toastComponentRef: Object;

export const extractErrorMessage = function (err: Object | string): string {
  if (!err) {
    return 'Unknown error';
  }

  if (typeof err === 'string') {
    return err;
  }

  const values = [
    err.status,
    err.message,
    err.error_message,
    err.error_description,
    err.error_children && err.error_children.map(it => it.error),
    err.body,
    err.bodyText,
    err._bodyText
  ].filter(msg => msg);

  return values.join('. ');
};

export async function resolveError (err: Object) {
  if (err.json) {
    try {
      return await err.json();
    } catch (e) {
      return err;
    }
  } else {
    return err;
  }
}

const showErrorMessage = function (message: string, error: Object) {
  log.warn(message, error);
  usage.trackError(error, message);
  showNotification(message, extractErrorMessage(error), toastComponentRef);
};

export function notifyError (message: string, err: Object) {
  return resolveError(err).then(extracted => showErrorMessage(message, extracted));
}

export function notify (message: string) {
  return showNotification(message, null, toastComponentRef, NOTIFY_DURATION);
}

export function setNotificationComponent (reference: Object) {
  toastComponentRef = reference;
}
