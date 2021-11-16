/* @flow */

import type {CustomError} from '../../flow/Error';
import {DEFAULT_ERROR_MESSAGE, UNSUPPORTED_ERRORS} from './error-messages';


export const extractErrorMessage = function (err: Object | string, isDescriptionOnly: ?boolean): string {
  if (!err) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof err === 'string') {
    return err;
  }

  let fields = [
    err.error_description,
    err.error_children && err.error_children.map(it => it.error),
  ];

  if (!isDescriptionOnly) {
    fields = fields.concat([
      err.error_message,
      err.status,
      err.message,
      err.body,
      err.bodyText,
      err._bodyText,
    ]);
  }

  const errorText = fields.filter(Boolean).join('. ');
  return errorText || DEFAULT_ERROR_MESSAGE;
};

export async function resolveError(err: ?CustomError): Promise<any> {
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

export async function resolveErrorMessage(err: ?CustomError, isDescriptionOnly?: boolean): Promise<string> {
  const error = await resolveError(err);
  return extractErrorMessage(error, isDescriptionOnly);
}

export function getErrorMessage(error: ?CustomError): ?string {
  return error?.message || error?.localizedDescription || error?.error_description || '';
}

export function isUnsupportedFeatureError(error: ?CustomError): boolean {
  return Object.keys(UNSUPPORTED_ERRORS).map(
    (key: string) => UNSUPPORTED_ERRORS[key]
  ).includes(getErrorMessage(error));
}
