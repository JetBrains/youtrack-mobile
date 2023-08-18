import {DEFAULT_ERROR_MESSAGE} from './error-messages';
import type {CustomError} from 'types/Error';
export const extractErrorMessage = function (
  err: CustomError | string,
  isDescriptionOnly: boolean | null | undefined,
): string {
  if (!err) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof err === 'string') {
    return err;
  }

  let fields = [
    err.error_description,
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

  let errorText = fields.filter(Boolean).join('. ');
  if (err.error_children) {
    errorText = [errorText, ...err.error_children.map(it => it.error)].join('\n  - ');
  }
  return errorText || DEFAULT_ERROR_MESSAGE;
};
export async function resolveError(
  err: CustomError | null | undefined,
): Promise<any> {
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
export async function resolveErrorMessage(
  err: CustomError | null | undefined,
  isDescriptionOnly?: boolean,
): Promise<string> {
  const error = await resolveError(err);
  return extractErrorMessage(error, isDescriptionOnly);
}
export function getErrorMessage(
  error: CustomError | null | undefined,
): string {
  return (
    error?.message ||
    error?.localizedDescription ||
    error?.error_description ||
    ''
  );
}
