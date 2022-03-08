/* @flow */

import {CUSTOM_ERROR_MESSAGE} from '../error/error-messages';
import {getApi} from '../api/api__instance';
import {i18n} from '../i18n/i18n';
import {notify} from '../notification/notification';

import type {CommandSuggestionResponse} from 'flow/Issue';


const loadIssueCommandSuggestions = async (
  issueIds: Array<string>,
  command: string,
  caret: number
): Promise<CommandSuggestionResponse> => {
  try {
    return await getApi().getCommandSuggestions(issueIds, command, caret);
  } catch (err) {
    notify(CUSTOM_ERROR_MESSAGE.NO_COMMAND_SUGGESTIONS, err);
    return Promise.reject(err);
  }
};

const applyCommand = async (issueIds: Array<string>, command: string): Promise<void> => {
  try {
    const response: any = await getApi().applyCommand({issueIds, command});
    notify(i18n('Command applied'));
    return response;
  } catch (err) {
    notify(CUSTOM_ERROR_MESSAGE.APPLY_COMMAND_FAILED, err);
    return Promise.reject(err);
  }
};

export {
  applyCommand,
  loadIssueCommandSuggestions,
};
