import log from '../log/log';
import {checkVersion, FEATURE_VERSION} from '../feature/feature';
import {getStorageState} from '../storage/storage';
import {i18n} from 'components/i18n/i18n';
import {until} from 'util/util';
import type Api from '../api/api';
import type {Folder} from 'flow/User';
import type {TransformedSuggestion} from 'flow/Issue';
type CachedQueries = {
  id: string;
  name: string;
  query: string;
};
export function getCachedUserQueries(): Array<CachedQueries> {
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
): Promise<Array<TransformedSuggestion>> => {
  let suggestions: Array<{
    title: string | null;
    data: Array<TransformedSuggestion>;
  }> = [
    {
      title: null,
      data: [],
    },
  ];
  const folder: Folder | null = getStorageState().searchContext || null;
  const promise: Promise<Array<TransformedSuggestion>> = checkVersion(
    FEATURE_VERSION.searchAssist,
  )
    ? api.search.getQueryAssistSuggestions(
        query,
        caret,
        folder && folder.id ? [folder] : null,
      )
    : api.search.getQueryAssistSuggestionsLegacy(query, caret);
  const [error, assistSuggestions] = await until(promise);

  if (error) {
    log.warn('Failed loading assist suggestions');
  } else {
    suggestions = [
      {
        title: null,
        data: assistSuggestions,
      },
    ];
    const cachedUserQueries: Array<CachedQueries> = getCachedUserQueries();

    if (cachedUserQueries.length) {
      suggestions.push({
        title: i18n('Recent searches'),
        data: cachedUserQueries,
      });
    }
  }

  return suggestions;
};