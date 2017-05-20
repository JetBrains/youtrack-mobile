/* @flow */
import * as types from './issue-list-action-types';
import {AsyncStorage} from 'react-native';
import ApiHelper from '../../components/api/api__helper';
import {notifyError, resolveError} from '../../components/notification/notification';
import Cache from '../../components/cache/cache';
import type Api from '../../components/api/api';
import type {IssueOnList} from '../../flow/Issue';

const PAGE_SIZE = 10;
const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';
const LAST_QUERIES_STORAGE_KEY = 'YT_LAST_QUERIES_STORAGE_KEY';
const MAX_STORED_QUERIES = 5;
const lastQueriesCache = new Cache(LAST_QUERIES_STORAGE_KEY);

type ApiGetter = () => Api;

export function setIssuesQuery(query: string) {
  return {
    type: types.SET_ISSUES_QUERY,
    query
  };
}

export function readStoredIssuesQuery() {
  return async (dispatch: (any) => any) => {
    const query = await AsyncStorage.getItem(QUERY_STORAGE_KEY);
    dispatch({
      type: types.SET_ISSUES_QUERY,
      query: query
    });
  };
}

export function suggestIssuesQuery(query: string, caret: number) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    try {
      let suggestions;
      if (query) {
        suggestions = await api.getQueryAssistSuggestions(query, caret);
      } else {
        const currentUser = getState().app.auth.currentUser;
        suggestions = await api.getSavedQueries();
        suggestions = suggestions.filter(s => s.owner.ringId === currentUser.id);

        const lastQueries = (await lastQueriesCache.read() || []).map(query => ({name: query, query}));
        suggestions = [...suggestions, ...lastQueries];
      }

      dispatch({type: types.SUGGEST_QUERY, suggestions});
    } catch (e) {
      notifyError('Failed to load suggestions', e);
      dispatch({type: types.SUGGEST_QUERY, suggestions: []});
    }
  };
}

export function clearAssistSuggestions() {
  return {type: types.CLEAR_SUGGESTIONS};
}

async function storeLastQuery(query: string) {
  if (!query) {
    return;
  }
  const storedQueries = await lastQueriesCache.read() || [];
  const updatedQueries = [query, ...storedQueries];
  const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).
    slice(0, MAX_STORED_QUERIES);

  lastQueriesCache.store(uniqueUpdatedQueries);
}

export function storeIssuesQuery(query: string) {
  return () => {
    AsyncStorage.setItem(QUERY_STORAGE_KEY, query);
    storeLastQuery(query);
  };
}

export function listEndReached() {
  return {type: types.LIST_END_REACHED};
}

export function startIssuesLoading() {
  return {type: types.START_ISSUES_LOADING};
}

export function stopIssuesLoading() {
  return {type: types.STOP_ISSUES_LOADING};
}

export function startMoreIssuesLoading(newSkip: number) {
  return {type: types.START_LOADING_MORE, newSkip};
}

export function stopMoreIssuesLoading() {
  return {type: types.STOP_LOADING_MORE};
}

export function receiveIssues(issues: Array<IssueOnList>) {
  return {type: types.RECEIVE_ISSUES, issues, pageSize: PAGE_SIZE};
}

export function resetIssuesCount() {
  return {type: types.RESET_ISSUES_COUNT};
}

export function setIssuesCount(count: number) {
  return {type: types.SET_ISSUES_COUNT, count};
}

export function cacheIssues(issues: Array<IssueOnList>) {
  return (dispatch: (any) => any, getState: () => Object) => {
    const cache = getState().issueList.cache;
    cache.store(issues);
  };
}

export function readCachedIssues() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const cache = getState().issueList.cache;
    const issues: ?Array<IssueOnList> = await cache.read();
    if (issues && issues.length) {
      dispatch(receiveIssues(issues));
    }
  };
}

export function loadingIssuesError(error: Object) {
  return async (dispatch: (any) => any) => {
    dispatch(resetIssuesCount());
    const resolvedError = await resolveError(error);
    dispatch({type: types.LOADING_ISSUES_ERROR, error: resolvedError});
  };
}

export function loadIssues(query: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startIssuesLoading());
    dispatch(loadIssuesCount());
    try {
      let issues: Array<IssueOnList> = await api.getIssues(query, PAGE_SIZE);
      issues = ApiHelper.fillIssuesFieldHash(issues);
      dispatch(receiveIssues(issues));
      dispatch(cacheIssues(issues));
      if (issues.length < PAGE_SIZE) {
        dispatch(listEndReached());
      }
    } catch (e) {
      dispatch(loadingIssuesError(e));
    } finally {
      dispatch(stopIssuesLoading());
    }
  };
}

export function refreshIssues() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    dispatch(loadIssues(getState().issueList.query));
  };
}

export function initializeIssuesList() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    await readStoredIssuesQuery()(dispatch, getState);
    await readCachedIssues()(dispatch, getState);
    dispatch(refreshIssues());
  };
}

export function loadMoreIssues() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();

    const {isInitialized, isLoadingMore, isRefreshing, loadingError, isListEndReached, skip, issues, query} = getState().issueList;
    if (!isInitialized || isLoadingMore || isRefreshing || loadingError || isListEndReached) {
      return;
    }
    const newSkip = skip + PAGE_SIZE;

    dispatch(startMoreIssuesLoading(newSkip));

    try {
      let moreIssues: Array<IssueOnList> = await api.getIssues(query, PAGE_SIZE, newSkip);
      moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues);
      const updatedIssues = issues.concat(moreIssues);
      dispatch(receiveIssues(updatedIssues, moreIssues));
      dispatch(cacheIssues(updatedIssues));
      if (moreIssues.length < PAGE_SIZE) {
        dispatch(listEndReached());
      }
    } catch (err) {
      notifyError('Failed to fetch more issues', err);
    } finally {
      dispatch(stopMoreIssuesLoading());
    }
  };
}

export function loadIssuesCount() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {query} = getState().issueList;

    const count = await api.getIssuesCount(query);

    dispatch(setIssuesCount(count));
  };
}
