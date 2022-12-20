import {getApi} from '../api/api__instance';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from '../notification/notification';
import type {CommandSuggestionResponse} from 'types/Issue';

const loadIssueCommandSuggestions = async (
  issueIds: Array<string>,
  command: string,
  caret: number,
): Promise<CommandSuggestionResponse> => {
  try {
    return await getApi().getCommandSuggestions(issueIds, command, caret);
  } catch (err) {
    notifyError(err);
    return Promise.reject(err);
  }
};

const applyCommand = async (
  issueIds: Array<string>,
  command: string,
): Promise<void> => {
  try {
    const response: any = await getApi().applyCommand({
      issueIds,
      command,
    });
    notify(i18n('Command applied'));
    return response;
  } catch (err) {
    notifyError(err);
    return Promise.reject(err);
  }
};

export {applyCommand, loadIssueCommandSuggestions};
