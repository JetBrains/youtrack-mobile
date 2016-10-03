/* @flow */
import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';

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
    err.bodyText
  ].filter(msg => msg);

  return values.join('. ');
};

export function resolveError (err: Object) {
  if (err.json) {
    try {
      return err.json();
    } catch (e) {
      return Promise.resolve(err);
    }
  } else {
    return Promise.resolve(err);
  }
}

const showErrorMessage = function (message: string, error: Object) {
  log.warn(message, error);
  usage.trackError(error, message);
  showNotification(message, extractErrorMessage(error));
};

export function notifyError (message: string, err: Object) {
  return resolveError(err).then(extracted => showErrorMessage(message, extracted));
}
