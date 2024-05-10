import * as issuesActions from './issues-reducers';
import * as issueUpdater from 'components/issue-actions/issue-updater';
import ApiHelper from 'components/api/api__helper';
import log from 'components/log/log';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUES_PAGE, ANALYTICS_TICKETS_PAGE} from 'components/analytics/analytics-ids';
import {
  convertToNonStructural,
  createQueryFromFiltersSetting,
  getFilterFieldName,
} from 'views/issues/issues-helper';
import {
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
import {
  receiveUserAppearanceProfile, receiveUserHelpdeskProfile,
  setGlobalInProgress,
  setYTCurrentUser,
} from 'actions/app-actions';
import {whiteSpacesRegex} from 'components/wiki/util/patterns';

import type {ActivityItem} from 'types/Activity';
import type {CustomError} from 'types/Error';
import type {FilterField, FilterFieldValue} from 'types/Sorting';
import type {Folder, User, UserProfiles} from 'types/User';
import type {ISelectProps} from 'components/select/select';
import type {IssueOnList} from 'types/Issue';
import type {ISSWithItemActionsProps} from 'components/select/select-sectioned-with-item-and-star';
import type {ProjectHelpdesk} from 'types/Project';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import type {SortedIssues} from 'components/api/api__issues';

export interface ContextDataSource {
  title: string;
  data: Folder[];
}

export const PAGE_SIZE: number = 14;

const getDefaultHelpdeskSearchContext = (): ReduxAction<Folder | null> => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => getState().app.user?.profiles?.helpdesk?.helpdeskFolder || null;

const isDefaultHelpdeskSearchContext = (searchContextFolderId: string): ReduxAction<boolean> => (
  dispatch: ReduxThunkDispatch,
) => {
  const helpdeskSearchContext = dispatch(getDefaultHelpdeskSearchContext());
  return helpdeskSearchContext ? helpdeskSearchContext.id === searchContextFolderId : false;
};

const createDefaultHelpdeskSearchContext = (): ReduxAction<Folder> => (dispatch: ReduxThunkDispatch) => {
    const context = dispatch(getDefaultHelpdeskSearchContext());
    if (context) {
      return {
        ...context,
        name: i18n('Tickets'),
      };
    } else {
      return EVERYTHING_SEARCH_CONTEXT;
    }
  };

const getSearchContext = (): ReduxAction<Folder> => (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
  const issueList = getState().issueList;
  if (issueList.helpDeskMode) {
    const hsc = issueList.helpdeskSearchContext;
    return dispatch(isDefaultHelpdeskSearchContext(hsc.id)) ? dispatch(createDefaultHelpdeskSearchContext()) : hsc;
  }
  return issueList.searchContext;
};


const trackEvent = (msg: string, analyticsId: string = ANALYTICS_ISSUES_PAGE) => {
  usage.trackEvent(
    analyticsId,
    msg,
  );
};

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

const initSearchQuery = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  if (dispatch(isHelpDeskMode())) {
    dispatch(issuesActions.SET_HELPDESK_QUERY(getStorageState().helpdeskQuery || ''));
  } else {
    dispatch(issuesActions.SET_ISSUES_QUERY(getStorageState().query || ''));
  }
};

const suggestIssuesQuery = (query: string, caret: number): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const searchContext = dispatch(getSearchContext());
  const suggestions = await getAssistSuggestions(
    getApi(),
    query,
    caret,
    searchContext.id ? [searchContext] : [],
    'Issue',
  );
  dispatch(issuesActions.SUGGEST_QUERY(suggestions));
};

const storeIssuesQuery = (q: string): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  const query = q.trim();
  const data: {
    helpdeskQuery?: string;
    query?: string;
    lastQueries?: string[]
  } = dispatch(isHelpDeskMode()) ? {helpdeskQuery: query} : {query};
  if (q) {
    const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
    data.lastQueries = Array.from(new Set(updatedQueries)).slice(0, MAX_STORED_QUERIES);
  }
  flushStoragePart(data);
};

const startIssuesLoading = () => setGlobalInProgress(true);

const stopIssuesLoading = () => setGlobalInProgress(false);

const setIssuesError = (error: CustomError): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(issuesActions.RESET_ISSUES_COUNT());
  dispatch(issuesActions.LOADING_ISSUES_ERROR(error));
};

const cacheIssues = (issues: IssueOnList[]): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  let updatedCache: IssueOnList[] = issues;
  const isHelpdeskMode = dispatch(isHelpDeskMode());
  const cachedIssues: IssueOnList[] | null = isHelpdeskMode
    ? getStorageState().helpdeskCache
    : getStorageState().issuesCache;

  if (cachedIssues) {
    const issueActivityMap: Record<string, ActivityItem[]> = cachedIssues.reduce(
      (map: Record<string, ActivityItem[]>, it: IssueOnList) => {
        if (it.activityPage) {
          map[it.id] = it.activityPage;
        }

        return map;
      },
      {},
    );
    updatedCache = issues.map((it: IssueOnList) => {
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
    const issues: IssueOnList[] = await dispatch(doLoadIssues(query, pageSize));
    log.info(`${issues?.length} issues loaded`);

    dispatch(issuesActions.RECEIVE_ISSUES(issues));
    dispatch(cacheIssues(issues));

    if (issues.length < pageSize) {
      dispatch(issuesActions.SET_ISSUES_COUNT(issues.length));
      log.info('End reached during initial load');
      dispatch(issuesActions.LIST_END_REACHED());
    }
  } catch (e) {
    log.log(`Failed to load ${context}`);
    dispatch(setIssuesError(e as CustomError));
  } finally {
    dispatch(stopIssuesLoading());
  }
};

const getFiltersQuery = (): ReduxAction<string> => (dispatch: ReduxThunkDispatch) => {
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const filtersSettings: FilterSetting[] = Object.values(settings.search.filters!);
  return `${createQueryFromFiltersSetting(filtersSettings)}`;
};

const getQuery = (): ReduxAction<string> => (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
  const isHelpdeskMode = dispatch(isHelpDeskMode());
  const issueList = getState().issueList;
  return isHelpdeskMode ? issueList.helpdeskQuery : issueList.query;
};

const composeSearchQuery = (): ReduxAction<Promise<string>> => async (dispatch: ReduxThunkDispatch) => {
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const searchSettings: IssuesSetting = settings.search;
  let query: string = dispatch(getQuery());
  if (searchSettings.mode === issuesSearchSettingMode.filter) {
    query = `${dispatch(getFiltersQuery())} ${convertToNonStructural(query)}`;
  }
  return query.trim().replace(whiteSpacesRegex, ' ');
};

const refreshIssues = (): ReduxAction => async (dispatch: ReduxThunkDispatch): Promise<void> => {
  const searchQuery: string = await dispatch(composeSearchQuery());
  dispatch(issuesActions.SET_ISSUES_COUNT(null));
  dispatch(loadIssues(searchQuery));
  dispatch(refreshIssuesCount());
};

const onQueryUpdate = (query: string): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch(storeIssuesQuery(query));
  if (dispatch(isHelpDeskMode())) {
    dispatch(issuesActions.SET_HELPDESK_QUERY(query));
  } else {
    dispatch(issuesActions.SET_ISSUES_QUERY(query));
  }
  dispatch(issuesActions.CLEAR_SUGGESTIONS());
  dispatch(refreshIssues());
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
        let defaultContext: Folder[];
        if (!isHelpdeskMode) {
          defaultContext = currentSearchContext.id ? [EVERYTHING_SEARCH_CONTEXT] : [];
        } else {
          defaultContext = dispatch(isDefaultHelpdeskSearchContext(currentSearchContext.id))
            ? []
            : [dispatch(createDefaultHelpdeskSearchContext())];
        }

        return [
          {
            title: i18n('Projects'),
            data: [
              ...defaultContext,
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
      selectedItems: [{
        ...currentSearchContext,
        id: dispatch(isDefaultHelpdeskSearchContext(currentSearchContext.id)) ? null : currentSearchContext.id,
      }],
      onCancel: () => dispatch(issuesActions.CLOSE_SEARCH_CONTEXT_SELECT()),
      onSelect: async (searchContext: Folder) => {
        try {
          dispatch(issuesActions.CLOSE_SEARCH_CONTEXT_SELECT());
          const isHelpdeskMode = dispatch(isHelpDeskMode());
          dispatch(
            isHelpdeskMode
              ? issuesActions.SET_HELPDESK_CONTEXT(searchContext)
              : issuesActions.SET_SEARCH_CONTEXT(searchContext)
          );
          await flushStoragePart(isHelpdeskMode ? {helpdeskSearchContext: searchContext} : {searchContext});
          dispatch(refreshIssues());
        } catch (error) {
          log.warn('Failed to change a context', error);
        }
      },
      hasStar: (folder: Folder) => folder.pinned,
      onStar: (folder: Folder) => api.issueFolder.issueFolders(folder.id, {pinned: !folder.pinned}),
    };
    dispatch(issuesActions.OPEN_SEARCH_CONTEXT_SELECT(searchContextSelectProps));
  };
};

const onOpenHelpDeskProjectsSelect = (): ReduxAction => {
  return (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    trackEvent('Tickets: select create project', ANALYTICS_TICKETS_PAGE);
    const onCancel = () => dispatch(issuesActions.CLOSE_SEARCH_CONTEXT_SELECT());
    const selectProps: ISelectProps = {
      placeholder: i18n('Filter projects'),
      getValue: (project: ProjectHelpdesk) => `${project.name} (${project.shortName})`,
      dataSource: async (q: string = ''): Promise<ProjectHelpdesk[]> => {
        const projectHelpdesks = getState().issueList.helpDeskProjects;
        if (q.length) {
          return projectHelpdesks.filter(p => p.name.indexOf(q) !== -1 || p.shortName.indexOf(q) !== -1);
        }
        return projectHelpdesks;
      },
      selectedItems: [],
      onCancel,
      onSelect: async (project: ProjectHelpdesk) => {
        onCancel();
        Router.HelpDeskFeedback({project});
      },
    };
    dispatch(issuesActions.OPEN_SEARCH_CONTEXT_SELECT(selectProps));
  };
};

const getIssuesSettings = (): ReduxAction<IssuesSettings> => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
): IssuesSettings => {
  return getState().issueList.settings;
};


const cachedIssuesSettings = (settings?: IssuesSettings): ReduxAction<IssuesSettings> =>
  (dispatch: ReduxThunkDispatch): IssuesSettings => {
    const helpdeskMode = dispatch(isHelpDeskMode());
    if (settings) {
      dispatch(issuesActions.SET_LIST_SETTINGS(settings));
      flushStoragePart(helpdeskMode ? {helpdeskSettings: settings} : {issuesSettings: settings});
    }
    const storageState = getStorageState();
    return (
      settings || (helpdeskMode ? storageState.helpdeskSettings : storageState.issuesSettings) || issuesSettingsDefault
    );
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
      const q = await dispatch(composeSearchQuery());
      const contextQuery = await dispatch(getSearchContext()).query;
      const [error, filterFieldValues] = await until(
        filterSetting.filterField.map(
          (it: FilterField) => getApi().filterFields.filterFieldValues(it.id, prefix, `${contextQuery} ${q}`)
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
    onCancel: () => dispatch(issuesActions.CLOSE_SEARCH_CONTEXT_SELECT()),
    onSelect: async (selected: { id: string; name: string }[]) => {
      try {
        dispatch(issuesActions.CLOSE_SEARCH_CONTEXT_SELECT());
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
  dispatch(issuesActions.OPEN_SEARCH_CONTEXT_SELECT(selectProps));
};

const resetFilterFields = (): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
) => {
  trackEvent(`${isHelpDeskMode() ? 'Tickets' : 'Issues'}: reset all filters`);
  const settings: IssuesSettings = dispatch(getIssuesSettings());
  const filters = settings.search.filters || {};
  const issuesSettings: IssuesSettings = {
    ...settings,
    search: {
      ...settings.search,
      filters: Object.keys(filters).reduce((akk, key) => {
        return {
          ...akk,
          [key]: {
            key,
            filterField: filters[key].filterField,
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
  const appState = getState();
  const contextFolder = dispatch(getSearchContext());
  const [error, sortedIssues] = await until<SortedIssues>(
    api.issues.sortedIssues(contextFolder.id, query, pageSize, skip)
  );
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
  const currentIssues = getState().issueList.issues;
  const issueToUpdate = await issueUpdater.loadIssue(issueId);

  if (issueToUpdate) {
    const updatedIssues: IssueOnList[] = issueUpdater.updateIssueInIssues(
      issueToUpdate,
      currentIssues,
    );
    dispatch(issuesActions.RECEIVE_ISSUES(updatedIssues as IssueOnList[]));
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
    const issuesCount: number = await api.issues.getIssuesCount(
      _query,
      folder,
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
      dispatch(issuesActions.SET_ISSUES_COUNT(issuesCount));
    }
  } catch (e) {
    log.log(`Failed to load ${isHelpDeskMode() ? 'tickets' : 'issues'} count`);
  }
};

const initSearchContext = (searchQuery: string = ''): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  if (dispatch(isHelpDeskMode())) {
    const hdSearchContext =
      getStorageState().helpdeskSearchContext || dispatch(getDefaultHelpdeskSearchContext());
    if (hdSearchContext) {
      dispatch(issuesActions.SET_HELPDESK_CONTEXT(hdSearchContext));
    }
  } else {
    dispatch(
      issuesActions.SET_SEARCH_CONTEXT(
        searchQuery.trim()
          ? EVERYTHING_SEARCH_CONTEXT
          : getStorageState().searchContext || EVERYTHING_SEARCH_CONTEXT
      )
    );
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
    const helpdeskMode = dispatch(isHelpDeskMode());
    const userProfileFiltersNames: string[] = (helpdeskMode
      ? currentUser?.profiles?.helpdesk?.ticketFilters || []
      : currentUser?.profiles?.appearance?.liteUiFilters || []).filter(Boolean);

    const visibleFiltersNames: string[] = userProfileFiltersNames.length > 0 ? userProfileFiltersNames : [];
    if (userProfileFiltersNames.length === 0) {
      const ytCurrentUser: User = getStorageState().currentUser?.ytCurrentUser as User;
      const profiles: UserProfiles = {
        ...ytCurrentUser.profiles,
        ...Object.assign(
          {},
          helpdeskMode
            ? {helpdesk: {...ytCurrentUser.profiles.helpdesk, ticketFilters: visibleFiltersNames}}
            : {appearance: {...ytCurrentUser?.profiles?.appearance, liteUiFilters: visibleFiltersNames}}
        ),
      };
      dispatch(
        helpdeskMode
          ? receiveUserHelpdeskProfile(profiles?.helpdesk)
          : receiveUserAppearanceProfile(profiles?.appearance)
      );
      await dispatch(setYTCurrentUser({...ytCurrentUser, profiles}));
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
    dispatch(issuesActions.SET_ISSUES_QUERY(''));
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
  dispatch(issuesActions.RECEIVE_ISSUES([]));
  if (!preventReload) {
    dispatch(refreshIssues());
  }
};

const setIssuesMode = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(issuesActions.SET_HELPDESK_MODE(false));
};

const setIssuesFromCache = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  const cachedIssues: IssueOnList[] = getStorageState().issuesCache || [];
  if (cachedIssues.length > 0) {
    log.debug(`Loaded ${cachedIssues.length} cached issues`);
    dispatch(issuesActions.RECEIVE_ISSUES(cachedIssues));
  }
};

const initializeIssuesList = (searchQuery?: string): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(startIssuesLoading());

  if (searchQuery) {
    await dispatch(switchToQuerySearchSetting(true));
    await dispatch(storeIssuesQuery(searchQuery));
  }

  await dispatch(initSearchContext(searchQuery));
  await dispatch(initSearchQuery());
  await dispatch(setFilters());
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
    dispatch(issuesActions.START_LOADING_MORE(newSkip));

    try {
      const searchQuery = await dispatch(composeSearchQuery());
      let moreIssues: IssueOnList[] = await dispatch(doLoadIssues(searchQuery, pageSize, newSkip));
      log.info(`Loaded ${pageSize} more ${context}.`);
      moreIssues = ApiHelper.fillIssuesFieldHash(moreIssues) as IssueOnList[];
      const updatedIssues: IssueOnList[] = ApiHelper.removeDuplicatesByPropName(
        issues.concat(moreIssues),
        'id',
      ) as IssueOnList[];
      dispatch(issuesActions.RECEIVE_ISSUES(updatedIssues));
      dispatch(cacheIssues(updatedIssues));

      if (moreIssues.length < pageSize) {
        log.info(`End of ${context} reached: all ${updatedIssues?.length} are loaded`);
        dispatch(issuesActions.LIST_END_REACHED());
      }
    } catch (e) {
      log.log(`Failed to load more ${context}`);
      dispatch(setIssuesError(e as CustomError));
    } finally {
      dispatch(issuesActions.STOP_LOADING_MORE());
    }
  } catch (e) {
    log.log(`Failed to load more ${context}`);
  }
};


export {
  cachedIssuesSettings,
  cacheIssues,
  composeSearchQuery,
  doLoadIssues,
  getFiltersQuery,
  getIssueFromCache,
  getIssuesSettings,
  getPageSize,
  getSearchContext,
  initializeIssuesList,
  initSearchContext,
  isHelpDeskMode,
  isIssueMatchesQuery,
  loadIssues,
  loadIssuesCount,
  loadMoreIssues,
  onQueryUpdate,
  onSettingsChange,
  openContextSelect,
  openFilterFieldSelect,
  onOpenHelpDeskProjectsSelect,
  refreshIssues,
  refreshIssuesCount,
  resetFilterFields,
  setFilters,
  setIssuesError,
  setIssuesFromCache,
  setIssuesMode,
  initSearchQuery,
  startIssuesLoading,
  stopIssuesLoading,
  storeIssuesQuery,
  suggestIssuesQuery,
  switchToQuerySearchSetting,
  trackEvent,
  updateIssue,
};
