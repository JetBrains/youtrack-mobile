/* @flow */

import {IconAccountAlert} from '../icon/icon';
import {DEFAULT_ERROR_MESSAGE} from './error-messages';

import type {ErrorMessageData} from '../../flow/Error';
import {HTTP_STATUS} from './error-http-codes';


const unauthorizedErrorMessageData: ErrorMessageData = {
  title: 'Woah, you can\'t touch this!',
  description: 'You don\'t have sufficient permissions.',
};

const noIssueFoundDescriptionMessages: Array<string> = [
  'If this isn\'t what you expected, you might try one of these solutions:',
  'Search for a different value',
  'Use fewer search parameters',
];

const notFoundMessageData: ErrorMessageData = {
  title: 'Nope, can\'t find it!',
  description: 'It could mean that the issue doesn\'t exist or you don\'t have permission to view it',
};

export const ERROR_MESSAGE_DATA: { [string]: ErrorMessageData } = {
  DEFAULT: {
    title: 'Something went wrong',
  },
  NO_ISSUES_FOUND: {
    title: 'No issues found',
    description: noIssueFoundDescriptionMessages.join('\n'),
  },
  LICENSE_ERROR_RESPONSE: 'License error',
  'License error': {
    title: 'License error',
    icon: IconAccountAlert,
  },
  'invalid_query': {
    title: 'Invalid query',
  },
  'Not Found': notFoundMessageData,
  USER_BANNED: {
    title: 'User account is banned',
  },
  '2fa_required': {
    title: 'Your YouTrack account requires that you provide a second factor of authentication to log in. This option is only available when you log in with a mobile browser. The mobile browser will also let you sign in using a third-party account (if available).\n\nTo log in on this screen, enter your username and a one-time application password.',
  },

  [HTTP_STATUS.UNAUTHORIZED]: unauthorizedErrorMessageData,
  [HTTP_STATUS.FORBIDDEN]: unauthorizedErrorMessageData,
  [HTTP_STATUS.BAD_REQUEST]: {
    title: DEFAULT_ERROR_MESSAGE,
  },
  [HTTP_STATUS.NOT_FOUND]: notFoundMessageData,
  [HTTP_STATUS.GATEWAY_TIMEOUT]: {
    title: 'The server is overloaded or down for maintenance',
  },
};
