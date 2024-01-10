import log from 'components/log/log';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {until} from 'util/util';

import type Api from '../api/api';
import type {AssistSuggest, UsedQuery, TransformedSuggestion} from 'types/Issue';
import type {Folder} from 'types/User';

export function getCachedUserQueries(): UsedQuery[] {
  return (getStorageState().lastQueries || []).map(
    (query: string, index: number) => ({
      id: `lastQueries-${index}`,
      name: query,
      query,
    }),
  );
}

export const getAssistSuggestions = async (
  api: Api,
  query: string,
  caret: number,
  folders: Folder[] | Partial<Folder> = [],
  type?: string,
): Promise<AssistSuggest[]> => {
  let suggestions: AssistSuggest[] = [{
    title: null,
    data: [],
  }];
  const promise: Promise<Array<TransformedSuggestion>> = checkVersion(FEATURE_VERSION.searchAssist)
    ? api.search.getQueryAssistSuggestions(query, caret, folders, type)
    : api.search.getQueryAssistSuggestionsLegacy(query, caret);
  const [error, assistSuggestions] = await until<TransformedSuggestion[]>(promise);

  if (error) {
    log.warn('Failed loading assist suggestions');
  } else {
    suggestions = [{
      title: null,
      data: assistSuggestions,
    }];
    const cachedUserQueries: UsedQuery[] = getCachedUserQueries();

    if (cachedUserQueries.length) {
      suggestions.push({
        title: i18n('Recent searches'),
        data: cachedUserQueries,
      });
    }
  }

  return suggestions;
};
