/* @flow */

import type {CustomError} from '../../flow/Error';


export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  SUCCESS: 200,
  REDIRECT: 300
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

export async function resolveErrorMessage(err: ?CustomError): Promise<string> {
  const error = await resolveError(err);
  return extractErrorMessage(error);
}
