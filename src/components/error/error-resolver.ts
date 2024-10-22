import {DEFAULT_ERROR_MESSAGE} from './error-messages';

import type {AnyError} from 'types/Error';

export const extractErrorMessage = function (err: AnyError | string, isDescriptionOnly?: boolean): string {
  if (!err) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof err === 'string') {
    return err;
  }

  let fields = [err.error_description];

  if (!isDescriptionOnly) {
    fields = fields
      .concat([
        err.data?.error_description,
        err.message,
        err.error_message,
        err.data?.error_message,
        err.data?.error_developer_message,
        err.body,
        err.bodyText,
        `${err.status}`,
      ])
      .filter(it => !!it);
  }

  let errorText = fields.filter(i => i != null).join('. ');
  if (err.data?.error_children) {
    errorText = err.data?.error_children
      ?.map(it => {
        const messages = [it.error_description];
        if (it.error_developer_message && !messages.includes(it.error_developer_message)) {
          messages.push(it.error_developer_message);
        }
        return messages.join('. ');
      })
      ?.join('\n  - ');
  }
  return errorText || DEFAULT_ERROR_MESSAGE;
};

export async function resolveError(err: AnyError): Promise<AnyError> {
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

export async function resolveErrorMessage(err: AnyError, isDescriptionOnly?: boolean) {
  const error = await resolveError(err);
  return extractErrorMessage(error, isDescriptionOnly);
}

export function getErrorMessage(error: AnyError): string {
  return extractErrorMessage(error, true) || error?.message || '';
}
