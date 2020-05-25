/* @flow */

import * as types from './issue-list-action-types';
import ApiHelper from '../../components/api/api__helper';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';
import {notifyError} from '../../components/notification/notification';
import {resolveError} from '../../components/error/error-resolver';
import log from '../../components/log/log';
import usage from '../../components/usage/usage';

import type Api from '../../components/api/api';
import type {IssueOnList, SavedQuery} from '../../flow/Issue';
import type {Folder} from '../../flow/User';
import {updateUserGeneralProfile} from '../../actions/app-actions';
import {EVERYTHING_CONTEXT} from '../../components/search/search-context';
import {sortByName} from '../../components/search/sorting';

const PAGE_SIZE = 10;
const MAX_STORED_QUERIES = 5;
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

export function setIssuesCount(count: number) {
  return {type: types.SET_ISSUES_COUNT, count};
}

export function updateSearchContextPinned(isPinned: boolean) {
  return {type: types.IS_SEARCH_CONTEXT_PINNED, isSearchContextPinned: isPinned};
}

export function closeIssuesContextSelect() {
  return {type: types.CLOSE_SEARCH_CONTEXT_SELECT};
}

export function getSearchQuery(query: string) {
  return () => {
    const userSearchContext: SavedQuery = getStorageState().searchContext;
    const searchContextQuery = userSearchContext?.query;
    return `${searchContextQuery} ${query}`;
  };
}


export function onQueryUpdate(query: string) {
  return (dispatch: (any) => any) => {
    const searchQuery = dispatch(getSearchQuery(query));
    dispatch(storeIssuesQuery(query));
    dispatch(setIssuesQuery(query));
    dispatch(clearAssistSuggestions());
    dispatch(loadIssues(searchQuery));
  };
}

export function openIssuesContextSelect() {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const currentUser = getState().app?.user;
    const currentUserGeneralProfile = currentUser?.profiles?.general;
    const currentSearchContext = currentUserGeneralProfile?.searchContext || EVERYTHING_CONTEXT;
    const starTagId = currentUserGeneralProfile?.star?.id;

    trackEvent('Issue list context select');

    dispatch({
      type: types.OPEN_SEARCH_CONTEXT_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Filter items',
        dataSource: async () => {
          const folders = await api.user.getUserFolders();
          const groupedFolders = getGroupedFolders(folders, currentSearchContext, starTagId);

          return [EVERYTHING_CONTEXT].concat(
            groupedFolders.current,
            groupedFolders.star,
            groupedFolders.pinned.sort(sortByName),
            groupedFolders.regular.sort(sortByName)
          );
        },
        selectedItems: [currentSearchContext],
        onCancel: () => dispatch(closeIssuesContextSelect()),
        onSelect: async (selectedContext: Folder) => {
          try {
            dispatch(closeIssuesContextSelect());

            await dispatch(storeSearchContext(selectedContext));
            dispatch(updateUserGeneralProfile({
              searchContext: selectedContext.id ? selectedContext : null
            }));

            dispatch(refreshIssues());
          } catch (error) {
            log.warn('Failed to change a context', error);
          }
        }
      }
    });

    function getGroupedFolders(folders: Array<Folder>, currentSearchContext: Folder, starTagId: string) {
      return folders.reduce(
        (list, folder) => {
          let target;
          switch (true) {
          case currentSearchContext?.id === folder.id:
            target = list.current;
            break;
          case folder.id === starTagId:
            target = list.star;
            break;
          case list.pinned:
            target = list.pinned;
            break;
          default:
            target = list.regular;
          }

          if (Array.isArray(target)) {
            target.push(folder);
          }
          return list;
        },
        {
          pinned: [],
          regular: [],
          star: [],
          current: []
        }
      );
    }
  };
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
    const additionalQuery: string = getState().issueList.query;
    const searchQuery: string = await dispatch(getSearchQuery(additionalQuery));

    dispatch(loadIssues(searchQuery));
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

    if (query) {
      dispatch(loadIssues(query));
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

export function loadIssuesCount() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {query} = getState().issueList;

    const count = await api.issues.getIssuesCount(query);

    dispatch(setIssuesCount(count));
  };
}
