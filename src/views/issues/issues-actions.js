/* @flow */

import * as issueUpdater from '../../components/issue-actions/issue-updater';
import * as types from './issues-action-types';
import ApiHelper from '../../components/api/api__helper';
import log from '../../components/log/log';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {EVERYTHING_CONTEXT} from '../../components/search/search-context';
import {filterArrayByType} from '../../components/api/api__resource-types';
import {flushStoragePart, getStorageState, MAX_STORED_QUERIES} from '../../components/storage/storage';
import {getAssistSuggestions, getCachedUserQueries} from '../../components/query-assist/query-assist-helper';
import {notifyError} from '../../components/notification/notification';
import {until} from '../../util/util';
import {updateUserGeneralProfile} from '../../actions/app-actions';

import type Api from '../../components/api/api';
import type {Folder} from '../../flow/User';
import type {AnyIssue, IssueFull, SavedQuery} from '../../flow/Issue';
import type {IssueProject, Tag} from '../../flow/CustomFields';

const PAGE_SIZE = 10;

type ApiGetter = () => Api;

function trackEvent(msg: string, additionalParam: ?string) {
  usage.trackEvent(ANALYTICS_ISSUES_PAGE, msg, additionalParam);
}

export function setIssuesQuery(query: string): {query: string, type: any} {
  return {
    type: types.SET_ISSUES_QUERY,
    query,
  };
}

export function readStoredIssuesQuery(): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    const query = getStorageState().query || '';
    dispatch(setIssuesQuery(query));
  };
}

export function suggestIssuesQuery(query: string, caret: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const suggestions = await getAssistSuggestions(getApi(), query, caret);
    dispatch({type: types.SUGGEST_QUERY, suggestions});
  };
}

export function clearAssistSuggestions(): {type: any} {
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

export function storeIssuesQuery(query: string): (() => void) {
  return () => {
    flushStoragePart({query});
    storeLastQuery(query);
  };
}

export function storeSearchContext(searchContext: Folder): () => Promise<void> {
  return async () => {await flushStoragePart({searchContext});};
}

export function listEndReached(): {type: any} {
  return {type: types.LIST_END_REACHED};
}

export function startIssuesLoading(): {type: any} {
  return {type: types.START_ISSUES_LOADING};
}

export function stopIssuesLoading(): {type: any} {
  return {type: types.STOP_ISSUES_LOADING};
}

export function startMoreIssuesLoading(newSkip: number): {newSkip: number, type: any} {
  return {type: types.START_LOADING_MORE, newSkip};
}

export function stopMoreIssuesLoading(): {type: any} {
  return {type: types.STOP_LOADING_MORE};
}

export function receiveIssues(issues: Array<AnyIssue>): {issues: Array<AnyIssue>, pageSize: number, type: any} {
  return {type: types.RECEIVE_ISSUES, issues, pageSize: PAGE_SIZE};
}

export function resetIssuesCount(): {type: any} {
  return {type: types.RESET_ISSUES_COUNT};
}

export function setIssuesCount(count: number | null): {count: number | null, type: any} {
  return {type: types.SET_ISSUES_COUNT, count};
}

export function updateSearchContextPinned(isPinned: boolean): {isSearchContextPinned: boolean, type: any} {
  return {type: types.IS_SEARCH_CONTEXT_PINNED, isSearchContextPinned: isPinned};
}

function getSearchContext() {
  return getStorageState().searchContext;
}

export function getSearchQuery(query: string = ''): (() => string) {
  return () => {
    const userSearchContext: ?Folder = getSearchContext();
    const searchContextQuery: string = userSearchContext?.query || '';
    return userSearchContext?.query ? `${searchContextQuery} ${query}` : query;
  };
}


export function onQueryUpdate(query: string): ((dispatch: (any) => any) => void) {
  return (dispatch: (any) => any) => {
    dispatch(storeIssuesQuery(query));
    dispatch(setIssuesQuery(query));
    dispatch(clearAssistSuggestions());
    dispatch(refreshIssues());
  };
}

export function openSavedSearchesSelect(): ((dispatch: (any) => any, getState: () => any, getApi: ApiGetter) => void) {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    trackEvent('Issue saved searches select');
    const savedSearchesSelectProps = {
      isOwnSearches: true,
      show: true,
      placeholder: 'Filter saved searches',
      dataSource: async () => {
        let folders: Array<Object> = getCachedUserQueries();
        try {
          const issueFolders: Array<IssueProject | SavedQuery | Tag> = await getApi().getIssueFolders(true);
          folders = [{
            title: null,
            data: filterArrayByType((issueFolders: any), 'savedSearch'),
          }, {
            title: 'Recent searches',
            data: folders,
          }];
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
          dispatch(onQueryUpdate(savedQuery.query || ''));
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
    };

    dispatch(openSelect(savedSearchesSelectProps));
  };
}

export function openContextSelect(): ((dispatch: (any) => any, getState: () => any, getApi: ApiGetter) => void) {
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
        let folders: Array<Folder> = [];
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
            searchContext: selectedContext.id ? selectedContext : null,
          }));
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
    };

    dispatch(openSelect(searchContextSelectProps));
  };
}

export function openSelect(selectsProps: Object): ((dispatch: (any) => any) => void) {
  return (dispatch: (any) => any) => {
    dispatch({
      type: types.OPEN_SEARCH_CONTEXT_SELECT,
      selectProps: selectsProps,
    });
  };
}

export function closeSelect(): ((dispatch: (any) => any) => void) {
  return (dispatch: (any) => any) => {
    dispatch({type: types.CLOSE_SEARCH_CONTEXT_SELECT});
  };
}


export function cacheIssues(issues: Array<AnyIssue>): (() => void) {
  return () => {
    flushStoragePart({issuesCache: issues});
  };
}

export function readCachedIssues(): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    const issues: Array<AnyIssue>| null = getStorageState().issuesCache;

    if (issues?.length) {
      log.debug(`Loaded ${issues.length} cached issues`);
      dispatch(receiveIssues(issues));
    }
  };
}

export function loadingIssuesError(error: Object): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    dispatch(resetIssuesCount());
    dispatch({type: types.LOADING_ISSUES_ERROR, error: error});
  };
}

export function loadIssues(query: string): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    try {
      const api: Api = getApi();
      log.info('Loading issues...');

      dispatch(startIssuesLoading());
      const [error, listIssues] = await until(api.issues.getIssues(query, PAGE_SIZE));
      dispatch(stopIssuesLoading());

      if (error) {
        dispatch(loadingIssuesError(error));
      } else {
        const issues: Array<AnyIssue> = ApiHelper.fillIssuesFieldHash(listIssues);
        log.info(`${issues?.length} issues loaded`);
        dispatch(receiveIssues(issues));
        dispatch(cacheIssues(issues));
        if (issues?.length < PAGE_SIZE) {
          log.info('End reached during initial load');
          dispatch(listEndReached());
        }
      }
    } catch (e) {
      log.log('Failed to load issues');
    }

  };
}

export function updateIssue(issueId: string): ((dispatch: (any) => any, getState: () => any) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const currentIssues: Array<AnyIssue> = getState().issueList.issues;

    const issueToUpdate: IssueFull | null = await issueUpdater.loadIssue(issueId);
    if (issueToUpdate) {
      const updatedIssues: Array<AnyIssue> = issueUpdater.updateIssueInIssues(issueToUpdate, currentIssues);

      dispatch(receiveIssues(updatedIssues));
      dispatch(cacheIssues(updatedIssues));
    }
  };
}

export function refreshIssues(): (dispatch: (any) => any, getState: () => any) => Promise<void> {
  return async (dispatch: (any) => any, getState: () => Object): Promise<void> => {
    const userQuery: string = getState().issueList.query;
    const searchQuery: string = await dispatch(getSearchQuery(userQuery));

    dispatch(setIssuesCount(null));
    dispatch(loadIssues(searchQuery));
    dispatch(refreshIssuesCount());
  };
}

export function refreshIssuesCount(): (dispatch: (any) => any, getState: () => any) => Promise<void> {
  return async (dispatch: (any) => any, getState: () => Object): Promise<void> => {
    const userQuery: string = getState().issueList.query;
    const searchQuery: string = await dispatch(getSearchQuery(userQuery));
    dispatch(loadIssuesCount(searchQuery, getSearchContext()));
  };
}

export function initializeIssuesList(isAppStart: boolean = false): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    await dispatch(readCachedIssues());
    if (!isAppStart) {
      dispatch(refreshIssues());
    }
  };
}

export function loadMoreIssues(): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    try {
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
        let moreIssues: Array<AnyIssue> = (await api.issues.getIssues(searchQuery, PAGE_SIZE, newSkip): any);
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
    } catch (e) {
      log.log('Failed to load more issues');
    }
  };
}

export function loadIssuesCount(query: ?string, folder: ?Folder): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    try {
      const api: Api = getApi();
      const abortController: AbortController = new AbortController();
      const issuesCount: number = await api.issues.getIssuesCount(query, folder, false, abortController);
      if (issuesCount === -1 && !abortController.signal.aborted) {
        return new Promise((resolve, reject) => {
          let timer: ?TimeoutID = setTimeout(resolve, 3000);
          abortController.signal.onabort = () => {
            reject();
            clearTimeout(timer);
            timer = null;
          };
        }).then(() => dispatch(loadIssuesCount(query, folder)));
      }
      if (issuesCount >= 0) {
        dispatch(setIssuesCount(issuesCount));
      }
    } catch (e) {
      log.log('Failed to load issues count');
    }
  };
}
