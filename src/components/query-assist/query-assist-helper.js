/* @flow */

import type {TransformedSuggestion} from "../../flow/Issue";import {getStorageState} from '../storage/storage';

import type Api from '../api/api';

export function getCachedUserQueries(): Array<Object> {
  return (getStorageState().lastQueries || []).map(
    (query: string, index: number) => ({
      id: `lastQueries-${index}`,
      name: query,
      query,
    }));
}

export const getAssistSuggestions = async (api: Api, query: string, caret: number): Promise<
  
    | Array<{data: Array<any>, title: null}>
    | Array<
      
        | {data: Array<TransformedSuggestion>, title: null}
        | {data: Array<any>, title: string},
    >,
> => {
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
