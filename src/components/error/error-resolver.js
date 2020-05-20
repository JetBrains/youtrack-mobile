/* @flow */

import type {CustomError} from '../../flow/Error';
import {DEFAULT_ERROR_MESSAGE, UNSUPPORTED_ERRORS} from './error-codes';


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

export function getErrorMessage(error: ?CustomError): ?string {
  return error?.message || error?.localizedDescription || '';
}

export function isUnsupportedFeatureError(error: ?CustomError): boolean {
  return Object.keys(UNSUPPORTED_ERRORS).map(
    (key: string) => UNSUPPORTED_ERRORS[key]
  ).includes(getErrorMessage(error));
}
