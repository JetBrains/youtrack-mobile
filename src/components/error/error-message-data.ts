import {DEFAULT_ERROR_MESSAGE} from './error-messages';
import {HTTP_STATUS} from './error-http-codes';
import {i18n} from 'components/i18n/i18n';
import {IconAccountAlert} from '../icon/icon';
import type {ErrorMessageData} from 'types/Error';

const unauthorizedErrorMessageData: ErrorMessageData = {
  title: i18n(`Woah, you can't touch this!`),
  description: i18n('Your account has insufficient permission to perform this operation.'),
};
const noIssueFoundDescriptionMessages: string[] = [
  i18n(`If this isn't what you expected, you might try one of these solutions:`),
  i18n('Search for a different value'),
  i18n('Use fewer search parameters'),
  i18n('Clear the current search context'),
  i18n('Wrap attribute values that contain spaces in braces {like this}.'),
];
const notFoundMessageData: ErrorMessageData = {
  title: i18n(`Nope, can't find it!`),
  description: i18n(
    `It could mean that the issue doesn't exist or you don't have permission to view it`,
  ),
};
export const ERROR_MESSAGE_DATA: Record<string, ErrorMessageData> = {
  DEFAULT: {
    title: i18n('Something went wrong'),
  },
  NO_ISSUES_FOUND: {
    title: i18n(`We didn't find any issues in the current search context that match your query`),
    description: noIssueFoundDescriptionMessages.join('\n  - '),
  },
  LICENSE_ERROR_RESPONSE: i18n('License error'),
  'License error': {
    title: i18n('License error'),
    icon: IconAccountAlert,
  },
  invalid_query: {
    title: i18n(`The search query contains unknown values`),
  },
  'Not Found': notFoundMessageData,
  USER_BANNED: {
    title: i18n('User account is banned'),
  },
  '2fa_required': {
    title: i18n(
      'Your YouTrack account requires that you provide a second factor of authentication to log in. This option is only available when you log in with a mobile browser. The mobile browser will also let you sign in using a third-party account (if available).\n\nTo log in on this screen, enter your username and a one-time application password.',
    ),
  },
  [HTTP_STATUS.UNAUTHORIZED]: unauthorizedErrorMessageData,
  [HTTP_STATUS.FORBIDDEN]: unauthorizedErrorMessageData,
  [HTTP_STATUS.BAD_REQUEST]: {
    title: DEFAULT_ERROR_MESSAGE,
  },
  [HTTP_STATUS.NOT_FOUND]: notFoundMessageData,
  [HTTP_STATUS.GATEWAY_TIMEOUT]: {
    title: i18n('The server is overloaded or down for maintenance'),
  },
};
