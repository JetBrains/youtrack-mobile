/* @flow */

import {getStorageState} from '../storage/storage';

import type Api from '../api/api';

export function getCachedUserQueries(): Array<Object> {
  return (getStorageState().lastQueries || []).map(
    (query: string, index: number) => ({
      id: `lastQueries-${index}`,
      name: query,
      query,
    }));
}

export const getAssistSuggestions = async (api: Api, query: string, caret: number) => {
  let suggestions = [{title: null, data: []}];
  try {
    const assistSuggestions = await api.getQueryAssistSuggestions(query, caret);
    const cachedUserQueries = getCachedUserQueries();
    suggestions = [{
      title: null,
      data: assistSuggestions,
    }];

    if (cachedUserQueries.length) {
      suggestions.push({
        title: 'Recent searches',
        data: cachedUserQueries,
      });
    }
  } catch (e) {
    //
  }
  return suggestions;
};
