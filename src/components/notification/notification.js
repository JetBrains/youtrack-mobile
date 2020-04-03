/* @flow */

import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';

const NOTIFY_DURATION = 3000;
let toastComponentRef: Object;

type CustomError = Error & {
  json: Object,
  status: string,
  error_message: string,
  error_description: string,
  error_children: Array<{error: string}>,
  body: string,
  bodyText: string,
  _bodyText: string,
  isIncompatibleYouTrackError: boolean
};

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';

export const extractErrorMessage = function (err: Object | string): string {
  if (!err) {
    return DEFAULT_ERROR_MESSAGE;
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
  ].filter(Boolean);

  return values.join('. ') || DEFAULT_ERROR_MESSAGE;
};

export async function resolveError(err: ?CustomError): Promise<Object> {
  if (err && err.json) {
    try {
      return await err.json();
    } catch (e) {
      return err;
    }
  } else {
    return err;
  }
}

export async function resolveErrorMessage(err: ?CustomError): Promise<Object> {
  const error = await resolveError(err);
  return extractErrorMessage(error);
}

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
