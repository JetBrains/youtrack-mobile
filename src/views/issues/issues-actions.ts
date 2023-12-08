import * as issueUpdater from 'components/issue-actions/issue-updater';
import * as types from './issues-action-types';
import ApiHelper from 'components/api/api__helper';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {
  convertToNonStructural,
  createQueryFromFiltersSetting,
  getFilterFieldName,
} from 'views/issues/issues-helper';
import {
  defaultIssuesFilterFieldConfig,
  FilterSetting,
  FiltersSetting,
  IssuesSetting,
  issuesSearchSettingMode,
  IssuesSettings,
  issuesSettingsDefault,
  issuesViewSettingMode,
  issuesSettingsSearch,
} from 'views/issues/index';
import {EVERYTHING_SEARCH_CONTEXT} from 'components/search/search-context';
import {flushStoragePart, getStorageState, MAX_STORED_QUERIES} from 'components/storage/storage';
import {getAssistSuggestions} from 'components/query-assist/query-assist-helper';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getGroupedFolders, GroupedFolders, sortFolders} from 'components/folder/folder';
import {i18n} from 'components/i18n/i18n';
import {guid, removeDuplicatesFromArray, until} from 'util/util';
import {receiveUserAppearanceProfile, setGlobalInProgress, setYTCurrentUser} from 'actions/app-actions';
import {SET_HELPDESK_MODE} from './issues-action-types';
import {whiteSpacesRegex} from 'components/wiki/util/patterns';

import type {AnyIssue, IssueFull, IssueOnList} from 'types/Issue';
import type {Folder, User} from 'types/User';
import {CustomError} from 'types/Error';
import {FilterField, FilterFieldValue} from 'types/CustomFields';
import {ISelectProps} from 'components/select/select';
import {ISSWithItemActionsProps} from 'components/select/select-sectioned-with-item-and-star';
import {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import {SortedIssues} from 'components/api/api__issues';

export interface ContextDataSource {
  title: string;
  data: Folder[];
}

type SortedIssuesData = [error: CustomError | null, sortedIssues: SortedIssues];

export const PAGE_SIZE: number = 14;

const getSearchContext = (): ReduxAction<Folder> => (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
  const appState = getState();
  return appState.issueList.helpDeskMode
    ? appState.issueList.helpdeskSearchContext
    : appState.issueList.searchContext;
};


const trackEvent = (msg: string, analyticsId: string = ANALYTICS_ISSUES_PAGE) => {
  usage.trackEvent(
    analyticsId,
    msg,
  );
};

const issuesQueryAction = (query: string) => ({
  type: types.SET_ISSUES_QUERY,
  query,
});

const helpdeskQueryAction = (helpdeskQuery: string) => ({
  type: types.SET_HELPDESK_QUERY,
  helpdeskQuery,
});

const getPageSize = (): ReduxAction<number> => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  return getState().issueList.settings.view.mode === issuesViewSettingMode.S ? PAGE_SIZE * 3 : PAGE_SIZE;
};

const isHelpDeskMode = (): ReduxAction<boolean> => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => getState().issueList.helpDeskMode;

const setStoredIssuesQuery = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  if (dispatch(isHelpDeskMode())) {
    dispatch(helpdeskQueryAction(getStorageState().helpdeskQuery || ''));
  } else {
    dispatch(issuesQueryAction(getStorageState().query || ''));
  }
};

const suggestIssuesQuery = (query: string, caret: number): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const suggestions = await getAssistSuggestions(getApi(), query, caret);
  dispatch({
    type: types.SUGGEST_QUERY,
    suggestions,
  });
};

const clearAssistSuggestions = () => ({
  type: types.CLEAR_SUGGESTIONS,
});

const storeIssuesQuery = (query: string): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  if (!query) {
    return;
  }

  const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
  const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).slice(
    0,
    MAX_STORED_QUERIES,
  );
  flushStoragePart({
    ...(dispatch(isHelpDeskMode()) ? {helpdeskQuery: query} : {query}),
    lastQueries: uniqueUpdatedQueries,
  });
};

const listEndReached = () => ({
  type: types.LIST_END_REACHED,
});

const startIssuesLoading = () => setGlobalInProgress(true);

const stopIssuesLoading = () => setGlobalInProgress(false);

const startMoreIssuesLoading = (newSkip: number) => ({
  type: types.START_LOADING_MORE,
  newSkip,
});

const stopMoreIssuesLoading = () => ({
  type: types.STOP_LOADING_MORE,
});

const receiveIssues = (issues: AnyIssue[], pageSize: number = PAGE_SIZE) => ({
  type: types.RECEIVE_ISSUES,
  issues,
  pageSize,
});

const resetIssuesCount = () => ({
  type: types.RESET_ISSUES_COUNT,
});

const setIssuesCount = (count: number | null) => ({
  type: types.SET_ISSUES_COUNT,
  count,
});

const updateSearchContextPinned = (isPinned: boolean) => ({
  type: types.IS_SEARCH_CONTEXT_PINNED,
  isSearchContextPinned: isPinned,
});

const setIssuesError = (error: CustomError): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(resetIssuesCount());
  dispatch({
    type: types.LOADING_ISSUES_ERROR,
    error: error,
  });
};

const cacheIssues = (issues: AnyIssue[]): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  let updatedCache: AnyIssue[] = issues;
  const isHelpdeskMode = dispatch(isHelpDeskMode());
  const cachedIssues: AnyIssue[] | null = isHelpdeskMode
    ? getStorageState().helpdeskCache
    : getStorageState().issuesCache;

  if (cachedIssues) {
    const issueActivityMap: Record<string, AnyIssue> = cachedIssues.reduce(
      (map: Record<string, AnyIssue>, it: AnyIssue) => {
        if (it.activityPage) {
          map[it.id] = it.activityPage;
        }

        return map;
      },
      {},
    );
    updatedCache = issues.map((it: AnyIssue) => {
      if (issueActivityMap[it.id]) {
        it.activityPage = issueActivityMap[it.id];
      }

      return it;
    });
  }

  flushStoragePart(isHelpdeskMode ? {helpdeskCache: updatedCache} : {issuesCache: updatedCache});
};

const loadIssues = (query: string): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const context = isHelpDeskMode() ? 'tickets' : 'issues';
  try {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (!isOffline) {
      dispatch(startIssuesLoading());
      log.info(`Loading ${context}...`);
    }
    const pageSize: number = dispatch(getPageSize());
    const issues: AnyIssue[] = await dispatch(doLoadIssues(query, pageSize));
    log.info(`${issues?.length} issues loaded`);

    dispatch(receiveIssues(issues, pageSize));
    dispatch(cacheIssues(issues));

    if (issues.length < pageSize) {
      dispatch(setIssuesCount(issues.length));
      log.info('End reached during initial load');
      dispatch(listEndReached());
    }
  } catch (e) {
    log.log(`Failed to load ${context}`);
    dispatch(setIssuesError(e as CustomError));
  } finally {
    dispatch(stopIssuesLoading());
  }
};

const composeSearchQuery = (): ReduxAction<Promise<string>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const isHelpdeskMode = dispatch(isHelpDeskMode());
  const issuesState = getState().issueList;
  const searchQuery: string = isHelpdeskMode ? issuesState.helpdeskQuery : issuesState.query;
  const searchSettings: IssuesSetting = settings.search;
  const isFilterMode: boolean = searchSettings.mode === issuesSearchSettingMode.filter;
  let query: string = (isFilterMode ? convertToNonStructural(searchQuery) : searchQuery).trim();
  if (isFilterMode) {
    const filtersSettings: FilterSetting[] = Object.values(settings.search.filters);
    query = `${query} ${createQueryFromFiltersSetting(filtersSettings)}`;
  }
  if (isHelpdeskMode) {
    const helpdeskSearchContext = issuesState.helpdeskSearchContext;
    query = `${query} ${helpdeskSearchContext.query}`;
  }
  return query.trim().replace(whiteSpacesRegex, ' ');
};

const refreshIssues = (): ReduxAction => async (dispatch: ReduxThunkDispatch): Promise<void> => {
  const searchQuery: string = await dispatch(composeSearchQuery());
  dispatch(setIssuesCount(null));
  dispatch(loadIssues(searchQuery));
  dispatch(refreshIssuesCount());
};

const onQueryUpdate = (query: string): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch(storeIssuesQuery(query));
  if (dispatch(isHelpDeskMode())) {
    dispatch(helpdeskQueryAction(query));
  } else {
    dispatch(issuesQueryAction(query));
  }
  dispatch(clearAssistSuggestions());
  dispatch(refreshIssues());
};

const searchContextAction = (searchContext: Folder) => ({
  type: types.SET_SEARCH_CONTEXT,
  searchContext,
});

const helpdeskSearchContextAction = (helpdeskSearchContext: Folder) => ({
  type: types.SET_HELPDESK_CONTEXT,
  helpdeskSearchContext,
});

const closeSelect = (): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch({
    type: types.CLOSE_SEARCH_CONTEXT_SELECT,
  });
};

const openSelect = (selectProps: Partial<ISelectProps>): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch({
    type: types.OPEN_SEARCH_CONTEXT_SELECT,
    selectProps,
  });
};

const openContextSelect = (): ReduxAction => {
  return (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    trackEvent(`${isHelpDeskMode() ? 'Tickets' : 'Issue list'} context select`);
    const api = getApi();
    const currentSearchContext = dispatch(getSearchContext());
    const searchContextSelectProps: Partial<ISSWithItemActionsProps> & { isSectioned: boolean } = {
      isSectioned: true,
      placeholder: i18n('Filter projects, saved searches, and tags'),
      dataSource: async (query: string = ''): Promise<ContextDataSource[]> => {
        const isHelpdeskMode = dispatch(isHelpDeskMode());
        const [error, userFolders] = await until(
          isHelpdeskMode
            ? api.savedQueries.getSavedQueries()
            : api.user.getUserFolders()
        ) as [CustomError | null, Folder[]];
        if (error) {
          log.warn('Failed to load user folders for the context');
          return [];
        }

        const filterHelpdeskFolders = (it: Folder) => isHelpdeskMode ? it.pinnedInHelpdesk : true;
        const pinnedFolders: Folder[] = userFolders.filter((it: Folder) => it.pinned).filter(filterHelpdeskFolders);
        const unpinnedFolders: Folder[] = userFolders.filter((it: Folder) => !it.pinned).filter(filterHelpdeskFolders);
        const pinnedGrouped: GroupedFolders = getGroupedFolders(pinnedFolders);
        const unpinnedGrouped: GroupedFolders = getGroupedFolders(unpinnedFolders);

        return [
          {
            title: i18n('Projects'),
            data: [
              isHelpdeskMode ? getState().issueList.helpdeskSearchContext : EVERYTHING_SEARCH_CONTEXT,
              ...sortFolders(pinnedGrouped.projects, query),
              ...sortFolders(unpinnedGrouped.projects, query),
            ],
          },
          {
            title: i18n('Tags'),
            data: [
              ...sortFolders(pinnedGrouped.tags, query),
              ...sortFolders(unpinnedGrouped.tags, query),
            ],
          },
          {
            title: i18n('Saved Searches'),
            data: [
              ...sortFolders(pinnedGrouped.searches, query),
              ...sortFolders(unpinnedGrouped.searches, query),
            ],
          },
        ];
      },
      selectedItems: [currentSearchContext],
      onCancel: () => dispatch(closeSelect()),
      onSelect: async (searchContext: Folder) => {
        try {
          dispatch(closeSelect());
          const isHelpdeskMode = dispatch(isHelpDeskMode());
          dispatch(
            isHelpdeskMode ? helpdeskSearchContextAction(searchContext) : searchContextAction(searchContext)
          );
          flushStoragePart(isHelpdeskMode ? {searchContext} : {helpdeskSearchContext: searchContext});
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
      hasStar: (folder: Folder) => folder.pinned,
      onStar: (folder: Folder) => api.issueFolder.issueFolders(folder.id, {pinned: !folder.pinned}),
    };
    dispatch(openSelect(searchContextSelectProps));
  };
};

const getIssuesSettings = (): ReduxAction<IssuesSettings> => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
): IssuesSettings => {
  return getState().issueList.settings;
};


const cachedIssuesSettings = (settings?: IssuesSettings): ReduxAction<IssuesSettings> => (dispatch: ReduxThunkDispatch): IssuesSettings => {
  if (settings) {
    dispatch({
      type: types.SET_LIST_SETTINGS,
      settings,
    });
    flushStoragePart({issuesSettings: settings});
  }
  return settings || getStorageState().issuesSettings || issuesSettingsDefault;
};

const openFilterFieldSelect = (filterSetting: FilterSetting): ReduxAction => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  trackEvent(`${isHelpDeskMode() ? 'Tickets' : 'Issues'} settings: changed filter`);
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const selectedItems: { name: string; id: string }[] = filterSetting.selectedValues.map(i => ({id: i, name: i}));
  const selectProps: Partial<ISelectProps> = {
    multi: true,
    getTitle: (it: FilterFieldValue) => getEntityPresentation(it),
    dataSource: async (prefix: string = '') => {
      const query = await dispatch(composeSearchQuery());
      const [error, filterFieldValues] = await until(
        filterSetting.filterField.map(
          (it: FilterField) => getApi().filterFields.filterFieldValues(it.id, prefix, query)
        ),
        true,
        true
      ) as [CustomError | null, FilterFieldValue[]];
      if (error) {
        log.warn('Failed to load user folders for the context');
      }
      const _values = removeDuplicatesFromArray(
        filterFieldValues.map(i => ({id: i?.id || guid(), name: i.presentation})).concat(selectedItems)
      );
      return error ? [] : _values;
    },
    selectedItems,
    onCancel: () => dispatch(closeSelect()),
    onSelect: async (selected: { id: string; name: string }[]) => {
      try {
        dispatch(closeSelect());
        const key: string = getFilterFieldName(filterSetting.filterField[0]);
        const issuesSettings: IssuesSettings = {
          ...settings,
          search: {
            ...settings.search,
            filters: {
              ...settings.search.filters,
              [key]: {
                key,
                filterField: filterSetting.filterField,
                selectedValues: selected.map(i => i.id),
              },
            },
          },
        };
        await dispatch(cachedIssuesSettings(issuesSettings));
        dispatch(refreshIssues());
      } catch (error) {
        log.warn('Failed to change a context', error);
      }
    },
  };
  dispatch(openSelect(selectProps));
};

const resetFilterFields = (): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
) => {
  trackEvent(`${isHelpDeskMode() ? 'Tickets' : 'Issues'}: reset all filters`);
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const issuesSettings: IssuesSettings = {
    ...settings,
    search: {
      ...settings.search,
      filters: Object.keys(settings.search.filters).reduce((akk, key) => {
        return {
          ...akk,
          [key]: {
            key,
            filterField: settings.search.filters[key].filterField,
            selectedValues: [],
          },
        };
      }, {}),
    },
  };
  await dispatch(cachedIssuesSettings(issuesSettings));
  dispatch(refreshIssues());
};

const doLoadIssues = (query: string, pageSize: number, skip = 0): ReduxAction<Promise<IssueOnList[]>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const handleError = (e: CustomError) => {
    throw e;
  };

  const api = getApi();
  let listIssues: IssueOnList[] = [];
  const isHelpdeskMode = dispatch(isHelpDeskMode());
  const appState = getState();
  const contextFolder = isHelpdeskMode
    ? appState.app.user?.profiles?.helpdesk?.helpdeskFolder || EVERYTHING_SEARCH_CONTEXT
    : dispatch(getSearchContext());
  const [error, sortedIssues]: SortedIssuesData = await until(
    api.issues.sortedIssues(contextFolder.id, query, pageSize, skip)
  ) as SortedIssuesData;
  if (error) {
    handleError(error);
  }

  if (Array.isArray(sortedIssues?.tree) && sortedIssues.tree.length > 0) {
    const [err, _issues] = await until(
      api.issues.issuesGetter(sortedIssues.tree, appState.issueList.settings.view.mode),
    );
    if (err) {
      handleError(err);
    }
    listIssues = ApiHelper.fillIssuesFieldHash(_issues) as IssueOnList[];
  }

  return listIssues;
};

const isIssueMatchesQuery = (issueIdReadable: string): ReduxAction<Promise<boolean>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const [error, listIssues] = await until(
    getApi().issues.getIssuesXShort(
      encodeURIComponent(`${await dispatch(composeSearchQuery())} #${issueIdReadable}`),
      1,
    ),
  );
  return !error && listIssues.length > 0;
};

const getIssueFromCache = (issueId: string): IssueOnList | null => {
  const cachedIssues: IssueOnList[] = getStorageState().issuesCache || [];
  return cachedIssues.find((it: IssueOnList) => it.id === issueId || it.idReadable === issueId) || null;
};

const updateIssue = (issueId: string): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const currentIssues: AnyIssue[] = getState().issueList.issues;
  const issueToUpdate: IssueFull | null = await issueUpdater.loadIssue(issueId);

  if (issueToUpdate) {
    const updatedIssues: AnyIssue[] = issueUpdater.updateIssueInIssues(
      issueToUpdate,
      currentIssues,
    );
    dispatch(receiveIssues(updatedIssues, dispatch(getPageSize())));
    dispatch(cacheIssues(updatedIssues));
  }
};

const refreshIssuesCount = (): (
  dispatch: ReduxThunkDispatch,
  getState: () => any,
) => Promise<void> => async (
  dispatch: ReduxThunkDispatch,
): Promise<void> => {
  dispatch(loadIssuesCount(dispatch(getSearchContext())));
};


const loadIssuesCount = (folder?: Folder | null): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  try {
    const api = getApi();
    const abortController: AbortController = new AbortController();
    const _query = await dispatch(composeSearchQuery());
    const _folder = getState().issueList.settings.search.mode === issuesSearchSettingMode.filter ? undefined : folder;
    const issuesCount: number = await api.issues.getIssuesCount(
      _query,
      _folder,
      false,
      abortController,
    );

    if (issuesCount === -1 && !abortController.signal.aborted) {
      return new Promise((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(resolve, 3000);

        abortController.signal.onabort = () => {
          reject();
          clearTimeout(timer);
          timer = undefined;
        };
      }).then(() => dispatch(loadIssuesCount(folder)));
    }

    if (issuesCount >= 0) {
      dispatch(setIssuesCount(issuesCount));
    }
  } catch (e) {
    log.log(`Failed to load ${isHelpDeskMode() ? 'tickets' : 'issues'} count`);
  }
};

const getStoredSearchContext = () => {
  return getStorageState().searchContext || EVERYTHING_SEARCH_CONTEXT;
};

const initSearchContext = (searchQuery: string = ''): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  let searchContext: Folder;
  if (dispatch(isHelpDeskMode)) {
    searchContext = getStorageState().currentUser?.ytCurrentUser?.profiles?.helpdesk?.helpdeskFolder as Folder;
    dispatch(helpdeskSearchContextAction(searchContext));
  } else {
    searchContext = searchQuery.trim() ? EVERYTHING_SEARCH_CONTEXT : getStoredSearchContext();
    dispatch(searchContextAction(searchContext));
  }
};

const switchToQuerySearchSetting = (preventReload?: boolean): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const settings: IssuesSettings = getState().issueList.settings;
  await dispatch(onSettingsChange({...settings, search: issuesSettingsSearch[0]}, preventReload));
};

const setFilters = (): (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => Promise<void> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  let settings: IssuesSettings = dispatch(cachedIssuesSettings());
  const [error, filterFields] = await until(getApi().customFields.getFilters());
  if (error) {
    log.warn('Cannot load filter fields');
  } else if (Array.isArray(filterFields) && filterFields.filter(Boolean).length > 0) {
    const currentUser: User | null = getState().app.user;
    const userProfileFiltersNames: string[] = (currentUser?.profiles?.appearance?.liteUiFilters || []).filter(
      Boolean);
    const visibleFiltersNames: string[] = (
      userProfileFiltersNames.length > 0
        ? userProfileFiltersNames
        : Object.values(defaultIssuesFilterFieldConfig)
    );

    if (userProfileFiltersNames.length === 0) {
      const ytCurrentUser = getStorageState().currentUser?.ytCurrentUser;
      const user = {
        ...ytCurrentUser,
        profiles: {
          ...ytCurrentUser.profiles,
          appearance: {
            ...ytCurrentUser.profiles?.appearance,
            liteUiFilters: visibleFiltersNames,
          },
        },
      };
      dispatch(
        receiveUserAppearanceProfile({
          ...user?.profiles?.appearance,
          liteUiFilters: visibleFiltersNames,
        })
      );
      await dispatch(setYTCurrentUser(user));
    }

    settings = {
      ...settings,
      search: {
        ...settings.search,
        filters: visibleFiltersNames.reduce((akk: FiltersSetting, it: string) => {
          const id: string = it.toLowerCase();
          const filterSettings: FilterSetting | undefined = settings.search.filters?.[id];
          const filterField: FilterField[] = filterFields.filter((i: FilterField) => {
            return getFilterFieldName(i) === id || id === i.id;
          });
          return {
            ...akk,
            [id]: {
              id,
              filterField,
              selectedValues: filterSettings?.selectedValues || [],
            },
          };
        }, {}),
      },
    };
    dispatch(cachedIssuesSettings(settings));
  } else {
    dispatch(switchToQuerySearchSetting());
  }
};

const onSettingsChange = (settings: IssuesSettings, preventReload?: boolean): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const currentSettings: IssuesSettings = getState().issueList.settings;
  const eventContext = dispatch(isHelpDeskMode()) ? `Issues` : `Tickets`;
  if (settings.search.mode !== currentSettings.search.mode) {
    trackEvent(`${eventContext} settings: switch mode to ${settings.search.mode}`);
    dispatch(issuesQueryAction(''));
    await flushStoragePart({query: null});
  }
  if (settings.view.mode !== currentSettings.view.mode) {
    trackEvent(`${eventContext} settings: change preview size to ${settings.view.mode}`);
  }
  await dispatch(cachedIssuesSettings(settings));
  await flushStoragePart({issuesCache: null});
  if (settings.search.mode === issuesSearchSettingMode.filter) {
    await dispatch(setFilters());
  }
  dispatch(receiveIssues([], dispatch(getPageSize())));
  if (!preventReload) {
    dispatch(refreshIssues());
  }
};

const setIssuesMode = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch({
    type: SET_HELPDESK_MODE,
    helpDeskMode: false,
  });
};

const initializeIssuesList = (searchQuery?: string): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(startIssuesLoading());

  if (searchQuery) {
    await dispatch(switchToQuerySearchSetting(true));
    await dispatch(storeIssuesQuery(searchQuery));
  }

  await dispatch(initSearchContext(searchQuery));
  await dispatch(setStoredIssuesQuery());
  await dispatch(setFilters());

  let cachedIssues: IssueOnList[] = [];
  if (dispatch(isHelpDeskMode())) {
    cachedIssues = getStorageState().helpdeskCache || [];
  } else if (!searchQuery) {
    cachedIssues = getStorageState().issuesCache || [];
  }
  if (cachedIssues.length > 0) {
    log.debug(`Loaded ${cachedIssues.length} cached ${isHelpDeskMode() ? 'tickets' : 'issues'}`);
    dispatch(receiveIssues(cachedIssues, dispatch(getPageSize())));
  }
  dispatch(refreshIssues());
};

const loadMoreIssues = (): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const context = isHelpDeskMode() ? 'tickets' : 'issues';
  try {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return;
    }

    const {
      isInitialized,
      isLoadingMore,
      isRefreshing,
      loadingError,
      isListEndReached,
      skip,
      issues,
    } = getState().issueList;

    if (
      !isInitialized ||
      isLoadingMore ||
      isRefreshing ||
      loadingError ||
      isListEndReached
    ) {
      return;
    }

    const pageSize: number = dispatch(getPageSize());
    const newSkip: number = skip + pageSize;
    log.info(`Loading more ${context}. newSkip = ${newSkip}`);
    dispatch(startMoreIssuesLoading(newSkip));

    try {
      const searchQuery = await dispatch(composeSearchQuery());
      let moreIssues: IssueOnList[] = await dispatch(doLoadIssues(searchQuery, pageSize, newSkip));
      log.info(`Loaded ${pageSize} more ${context}.`);
      moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues) as IssueOnList[];
      const updatedIssues: IssueOnList[] = ApiHelper.removeDuplicatesByPropName(
        issues.concat(moreIssues),
        'id',
      ) as IssueOnList[];
      dispatch(receiveIssues(updatedIssues, pageSize));
      dispatch(cacheIssues(updatedIssues));

      if (moreIssues.length < pageSize) {
        log.info(`End of ${context} reached: all ${updatedIssues?.length} are loaded`);
        dispatch(listEndReached());
      }
    } catch (e) {
      log.log(`Failed to load more ${context}`);
      dispatch(setIssuesError(e as CustomError));
    } finally {
      dispatch(stopMoreIssuesLoading());
    }
  } catch (e) {
    log.log(`Failed to load more ${context}`);
  }
};


export {
  cachedIssuesSettings,
  cacheIssues,
  clearAssistSuggestions,
  closeSelect,
  composeSearchQuery,
  doLoadIssues,
  getIssueFromCache,
  getIssuesSettings,
  getPageSize,
  getSearchContext,
  getStoredSearchContext,
  helpdeskQueryAction,
  helpdeskSearchContextAction,
  initializeIssuesList,
  initSearchContext,
  isHelpDeskMode,
  isIssueMatchesQuery,
  issuesQueryAction,
  listEndReached,
  loadIssues,
  loadIssuesCount,
  loadMoreIssues,
  onQueryUpdate,
  onSettingsChange,
  openContextSelect,
  openFilterFieldSelect,
  openSelect,
  receiveIssues,
  refreshIssues,
  refreshIssuesCount,
  resetFilterFields,
  resetIssuesCount,
  searchContextAction,
  setFilters,
  setIssuesCount,
  setIssuesError,
  setIssuesMode,
  setStoredIssuesQuery,
  startIssuesLoading,
  startMoreIssuesLoading,
  stopIssuesLoading,
  stopMoreIssuesLoading,
  storeIssuesQuery,
  suggestIssuesQuery,
  switchToQuerySearchSetting,
  trackEvent,
  updateIssue,
  updateSearchContextPinned,
};
