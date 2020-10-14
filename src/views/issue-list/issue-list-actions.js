/* @flow */

import ApiHelper from '../../components/api/api__helper';
import log from '../../components/log/log';
import usage from '../../components/usage/usage';
import {EVERYTHING_CONTEXT} from '../../components/search/search-context';
import {filterArrayByType} from '../../components/api/api__resource-types';
import {flushStoragePart, getStorageState, MAX_STORED_QUERIES} from '../../components/storage/storage';
import {getAssistSuggestions, getCachedUserQueries} from '../../components/query-assist/query-assist-helper';
import {notifyError} from '../../components/notification/notification';
import {sortAlphabetically} from '../../components/search/sorting';
import {updateUserGeneralProfile} from '../../actions/app-actions';

import * as types from './issue-list-action-types';

import type Api from '../../components/api/api';
import type {Folder} from '../../flow/User';
import type {IssueOnList, SavedQuery} from '../../flow/Issue';
import type {IssueProject, Tag} from '../../flow/CustomFields';

const PAGE_SIZE = 10;
const CATEGORY_NAME = 'Issue List';

type ApiGetter = () => Api;

function trackEvent(msg: string, additionalParam: ?string) {
  usage.trackEvent(CATEGORY_NAME, msg, additionalParam);
}

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
    const suggestions = await getAssistSuggestions(getApi(), query, caret);
    dispatch({type: types.SUGGEST_QUERY, suggestions});
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
  const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).slice(0, MAX_STORED_QUERIES);

  flushStoragePart({lastQueries: uniqueUpdatedQueries});
}

export function storeIssuesQuery(query: string) {
  return () => {
    flushStoragePart({query});
    storeLastQuery(query);
  };
}

export function storeSearchContext(searchContext: Folder) {
  return () => flushStoragePart({searchContext});
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

export function setIssuesCount(count: number | null) {
  return {type: types.SET_ISSUES_COUNT, count};
}

export function updateSearchContextPinned(isPinned: boolean) {
  return {type: types.IS_SEARCH_CONTEXT_PINNED, isSearchContextPinned: isPinned};
}

export function getSearchQuery(query: string = '') {
  return () => {
    const userSearchContext: SavedQuery = getStorageState().searchContext;
    const searchContextQuery = userSearchContext?.query;
    return userSearchContext?.query ? `${searchContextQuery} ${query}` : query;
  };
}


export function onQueryUpdate(query: string) {
  return (dispatch: (any) => any) => {
    dispatch(storeIssuesQuery(query));
    dispatch(setIssuesQuery(query));
    dispatch(clearAssistSuggestions());
    dispatch(refreshIssues());
  };
}

export function openSavedSearchesSelect() {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    trackEvent('Issue saved searches select');
    const savedSearchesSelectProps = {
      show: true,
      placeholder: 'Filter saved searches',
      dataSource: async () => {
        let folders: Array<Object> = getCachedUserQueries();
        try {
          const issueFolders: Array<IssueProject | SavedQuery | Tag> = await getApi().getIssueFolders(true);
          folders = filterArrayByType(issueFolders, 'savedSearch').sort(sortAlphabetically).concat(folders);
        } catch (e) {
          log.warn('Failed to load user saved searches');
        }
        return folders;
      },
      selectedItems: [],
      onCancel: () => dispatch(closeSelect()),
      onSelect: async (savedQuery: Folder) => {
        try {
          dispatch(closeSelect());
          dispatch(onQueryUpdate(savedQuery.query));
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      }
    };

    dispatch(openSelect(savedSearchesSelectProps));
  };
}

export function openContextSelect() {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    trackEvent('Issue list context select');

    const api: Api = getApi();
    const currentUser = getState().app?.user;
    const currentUserGeneralProfile = currentUser?.profiles?.general;
    const currentSearchContext = currentUserGeneralProfile?.searchContext || EVERYTHING_CONTEXT;
    const searchContextSelectProps = {
      show: true,
      placeholder: 'Filter projects, saved searches, and tags',
      dataSource: async () => {
        let folders = [];
        try {
          folders = await api.user.getUserFolders();
        } catch (e) {
          log.warn('Failed to load user folders for the context');
        }
        return [EVERYTHING_CONTEXT].concat(folders);
      },
      selectedItems: [currentSearchContext],
      onCancel: () => dispatch(closeSelect()),
      onSelect: async (selectedContext: Folder) => {
        try {
          dispatch(closeSelect());
          await dispatch(storeSearchContext(selectedContext));
          dispatch(updateUserGeneralProfile({
            searchContext: selectedContext.id ? selectedContext : null
          }));
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      }
    };

    dispatch(openSelect(searchContextSelectProps));
  };
}

export function openSelect(selectsProps: Object) {
  return (dispatch: (any) => any) => {
    dispatch({
      type: types.OPEN_SEARCH_CONTEXT_SELECT,
      selectProps: selectsProps
    });
  };
}

export function closeSelect() {
  return (dispatch: (any) => any) => {
    dispatch({type: types.CLOSE_SEARCH_CONTEXT_SELECT});
  };
}


export function cacheIssues(issues: Array<IssueOnList>) {
  return () => {
    flushStoragePart({issuesCache: issues});
  };
}

export function readCachedIssues() {
  return async (dispatch: (any) => any) => {
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
    dispatch({type: types.LOADING_ISSUES_ERROR, error: error});
  };
}

export function loadIssues(query: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    log.info('Loading issues...');
    dispatch(startIssuesLoading());

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
    const userQuery: string = getState().issueList.query;
    const searchQuery: string = await dispatch(getSearchQuery(userQuery));

    dispatch(loadIssues(searchQuery));
    dispatch(loadIssuesCount(searchQuery));
  };
}

export function initializeIssuesList(query: ?string) {
  return async (dispatch: (any) => any) => {
    if (query) {
      dispatch(setIssuesQuery(query));
    } else {
      await readStoredIssuesQuery()(dispatch);
    }
    await dispatch(readCachedIssues());

    if (query) {
      dispatch(loadIssues(query));
    } else {
      dispatch(refreshIssues());
    }
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
      const searchQuery = dispatch(getSearchQuery(query));
      let moreIssues: Array<IssueOnList> = await api.issues.getIssues(searchQuery, PAGE_SIZE, newSkip);
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
      notifyError('Failed to load more issues', err);
    } finally {
      dispatch(stopMoreIssuesLoading());
    }
  };
}

export function loadIssuesCount(query: string = '') {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();

    const count = await api.issues.getIssuesCount(query);

    dispatch(setIssuesCount(count));
  };
}
