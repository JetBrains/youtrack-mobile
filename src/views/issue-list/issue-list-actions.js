/* @flow */
import * as types from './issue-list-action-types';
import ApiHelper from '../../components/api/api__helper';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';
import {notifyError, resolveError} from '../../components/notification/notification';
import log from '../../components/log/log';
import type Api from '../../components/api/api';
import type {IssueOnList} from '../../flow/Issue';

const PAGE_SIZE = 10;
const MAX_STORED_QUERIES = 5;

type ApiGetter = () => Api;

export function setIssuesQuery(query: string) {
  return {
    type: types.SET_ISSUES_QUERY,
    query
  };
}

export function readStoredIssuesQuery() {
  return async (dispatch: (any) => any) => {
    const query = getStorageState().query || '';
    dispatch(setIssuesQuery(query));
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

        const lastQueries = (getStorageState().lastQueries || []).map(query => ({name: query, query}));
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

  const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
  const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).
    slice(0, MAX_STORED_QUERIES);

  flushStoragePart({lastQueries: uniqueUpdatedQueries});
}

export function storeIssuesQuery(query: string) {
  return () => {
    flushStoragePart({query});
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
  return (dispatch: (any) => any) => {
    flushStoragePart({issuesCache: issues});
  };
}

export function readCachedIssues() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const issues = getStorageState().issuesCache;

    if (issues && issues.length) {
      log.debug(`Loaded ${issues.length} cached issues`);
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
    log.info('Loading issues...');
    dispatch(startIssuesLoading());
    dispatch(loadIssuesCount());
    try {
      let issues: Array<IssueOnList> = await api.issues.getIssues(query, PAGE_SIZE);
      issues = ApiHelper.fillIssuesFieldHash(issues);
      log.info(`${issues?.length} issues loaded`);
      dispatch(receiveIssues(issues));
      dispatch(cacheIssues(issues));
      if (issues?.length < PAGE_SIZE) {
        log.info('End reached during initial load');
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

export function initializeIssuesList(query: ?string) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    if (query) {
      dispatch(setIssuesQuery(query));
    } else {
      await readStoredIssuesQuery()(dispatch);
    }
    await dispatch(readCachedIssues());
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

    log.info(`Loading more issues. newSkip = ${newSkip}`);
    dispatch(startMoreIssuesLoading(newSkip));

    try {
      let moreIssues: Array<IssueOnList> = await api.issues.getIssues(query, PAGE_SIZE, newSkip);
      log.info(`Loaded ${PAGE_SIZE} more issues.`);
      moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues);
      const updatedIssues = ApiHelper.removeDuplicatesByPropName(issues.concat(moreIssues), 'id');
      dispatch(receiveIssues(updatedIssues));
      dispatch(cacheIssues(updatedIssues));
      if (moreIssues?.length < PAGE_SIZE) {
        log.info(`End of issues reached: all ${updatedIssues?.length} issues are loaded`);
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

    const count = await api.issues.getIssuesCount(query);

    dispatch(setIssuesCount(count));
  };
}
