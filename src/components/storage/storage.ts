import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

import log from 'components/log/log';
import {getAuthParamsKey} from './storage__oauth';
import {i18n} from 'components/i18n/i18n';
import {IssuesSettings, issuesSettingsDefault} from 'views/issues';
import {notify} from 'components/notification/notification';
import {routeMap} from 'app-routes';

import type {Activity, ActivityType} from 'types/Activity';
import type {IssueOnListExtended} from 'types/Issue';
import type {AppConfig} from 'types/AppConfig';
import type {Article, ArticleProject, ArticlesList, ProjectArticlesData} from 'types/Article';
import type {Board, Sprint} from 'types/Agile';
import type {Folder, UserCurrent} from 'types/User';
import type {InboxThread, Notification, ThreadsStateFilterId} from 'types/Inbox';
import type {AuthParams} from 'types/Auth';
import type {PermissionCacheItem} from 'types/Permission';
import {Project} from 'types/Project';

const OTHER_ACCOUNTS_KEY = 'YT_OTHER_ACCOUNTS_STORAGE_KEY';
export const MAX_STORED_QUERIES = 5;
export const STORAGE_AUTH_PARAMS: string = 'yt_mobile_auth';
export const STORAGE_AUTH_PARAMS_KEY: string = 'yt_mobile_auth_key';
export const storageStateAuthParamsKey: string = 'authParamsKey';
export const THEME_MODE_KEY = 'YT_THEME_MODE';

export type InboxThreadsCache = {
  [folderId in ThreadsStateFilterId]: InboxThread[];
} & {
  unreadOnly: boolean;
  lastVisited: number;
};

const tipsKeys = {
  dismissActivityActionAccessTouch: 'YT_dismissActivityActionAccessTouch',
  dismissNotificationSwipe: 'YT_dismissNotificationSwipe',
};
type TipsState = Record<keyof typeof tipsKeys, boolean | null>

export const featuresKeys = {
  forceHandsetMode: 'YT_HANDSET_MODE',
  mergedNotifications: 'YT_mergedNotifications',
  notificationsSwipe: 'YT_notificationsSwipe',
};
type FeatureState = Record<keyof typeof featuresKeys, boolean | null>

type StorageStateKeys = Partial<Record<keyof StorageState, string>>;

export type StorageState = TipsState & FeatureState & {
  [key in typeof storageStateAuthParamsKey]: string | null;
} & {
  articles: ProjectArticlesData[] | null;
  articlesList: ArticlesList | null;
  articlesQuery: string | null;
  articleLastVisited: {
    article?: Article;
    activities?: Activity[];
  } | null;
  authParams: AuthParams | null;
  projectId: string | null;
  projects: (Project | ArticleProject)[];
  draftId: string | null;
  currentUser: UserCurrent | null;
  creationTimestamp: number | null;
  config: AppConfig | null;
  query: string | null;
  helpdeskQuery: string | null;
  searchContext: Folder | null;
  helpdeskSearchContext: Folder | null;
  lastQueries: string[] | null;
  issuesCache: IssueOnListExtended[] | null;
  helpdeskCache: IssueOnListExtended[] | null;
  inboxCache: Notification[] | null;
  inboxThreadsCache: InboxThreadsCache | null;
  isRegisteredForPush: boolean;
  deviceToken: string | null;
  agileZoomedIn: boolean | null;
  agileLastSprint: Sprint | null;
  agileDefaultBoard: Board | null;
  agileQuery: string | null;
  lastRoute:
    | (
        | typeof routeMap.Issues
        | typeof routeMap.Inbox
        | typeof routeMap.AgileBoard
        | typeof routeMap.KnowledgeBase
        | typeof routeMap.ArticleSingle
      )
    | null
    | undefined;
  currentAppVersion: string | null;
  issueActivitiesEnabledTypes: ActivityType[] | null;
  permissions: PermissionCacheItem[] | null;
  themeMode: string | null;
  vcsChanges: boolean | null;
  forceHandsetMode: boolean | null;
  issuesSettings: IssuesSettings;
  helpdeskSettings: IssuesSettings;
  helpdeskMenuHidden: boolean;
};

const storageKeys: StorageStateKeys & (typeof tipsKeys) & (typeof featuresKeys) = {
  ...tipsKeys,
  ...featuresKeys,
  articles: 'YT_ARTICLES',
  articlesList: 'YT_ARTICLES_LIST',
  articlesQuery: 'YT_ARTICLES_QUERY',
  articleLastVisited: 'YT_ARTICLE_LAST_VISITED',
  authParams: STORAGE_AUTH_PARAMS,
  [storageStateAuthParamsKey]: STORAGE_AUTH_PARAMS_KEY,
  projectId: 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
  projects: 'YT_PROJECTS_STORAGE',
  draftId: 'DRAFT_ID_STORAGE_KEY',
  currentUser: 'YT_CURRENT_USER_STORAGE_KEY',
  config: 'BACKEND_CONFIG_STORAGE_KEY',
  creationTimestamp: 'YT_CREATION_TIMESTAMP_STORAGE_KEY',
  query: 'YT_QUERY_STORAGE',
  helpdeskQuery: 'YT__HELPDESK_QUERY_STORAGE',
  searchContext: 'YT_SEARCH_CONTEXT_STORAGE',
  helpdeskSearchContext: 'YT_HELPDESK_SEARCH_CONTEXT_STORAGE',
  lastQueries: 'YT_LAST_QUERIES_STORAGE_KEY',
  issuesCache: 'yt_mobile_issues_cache',
  helpdeskCache: 'yt_mobile_helpdesk_cache',
  helpdeskMenuHidden: 'YT_MOBILE_HD_MENU_HIDDEN',
  inboxCache: 'YT_INBOX_CACHE',
  inboxThreadsCache: 'YT_INBOX_THREADS_CACHE',
  isRegisteredForPush: 'YT_IS_REGISTERED_FOR_PUSH',
  deviceToken: 'YT_DEVICE_TOKEN',
  agileZoomedIn: 'YT_AGILE_ZOOMED_IN',
  agileLastSprint: 'YT_AGILE_LAST_SPRINT',
  agileDefaultBoard: 'YT_AGILE_DEFAULT_BOARD',
  agileQuery: 'YT_AGILE_QUERY',
  lastRoute: 'YT_LAST_ROUTE',
  currentAppVersion: 'YT_CURRENT_APP_VERSION',
  issueActivitiesEnabledTypes: 'YT_ISSUE_ACTIVITIES_ENABLED_TYPES',
  permissions: 'YT_USER_PERMISSIONS',
  themeMode: THEME_MODE_KEY,
  vcsChanges: 'YT_VCS_CHANGES',
  issuesSettings: 'YT_ISSUES_SETTINGS',
  helpdeskSettings: 'YT_HELPDESK_SETTINGS',
};
let storageState: StorageState | null = null;

const hasValue = (v: any): boolean => v !== null && v !== undefined;

export const initialTipsState: Readonly<TipsState> = {
  dismissActivityActionAccessTouch: null,
  dismissNotificationSwipe: null,
};

export const initialFeaturesState: Readonly<FeatureState> = {
  mergedNotifications: null,
  forceHandsetMode: null,
  notificationsSwipe: true,
};

export const initialState: Readonly<StorageState> = {
  ...initialTipsState,
  ...initialFeaturesState,
  articles: null,
  articlesList: null,
  articlesQuery: null,
  articleLastVisited: null,
  authParams: null,
  [storageStateAuthParamsKey]: null,
  projectId: null,
  projects: [],
  draftId: null,
  currentUser: null,
  creationTimestamp: null,
  config: null,
  query: null,
  helpdeskQuery: null,
  searchContext: null,
  helpdeskSearchContext: null,
  lastQueries: null,
  issuesCache: null,
  helpdeskCache: null,
  inboxCache: null,
  inboxThreadsCache: null,
  isRegisteredForPush: false,
  deviceToken: null,
  agileZoomedIn: null,
  agileLastSprint: null,
  agileQuery: null,
  lastRoute: null,
  currentAppVersion: null,
  issueActivitiesEnabledTypes: null,
  permissions: null,
  agileDefaultBoard: null,
  themeMode: null,
  vcsChanges: null,
  forceHandsetMode: null,
  issuesSettings: issuesSettingsDefault,
  helpdeskSettings: issuesSettingsDefault,
  helpdeskMenuHidden: false,
};

export async function clearCachesAndDrafts(): Promise<StorageState> {
  log.info('Storage drafts has been cleared');
  await AsyncStorage.multiRemove([
    storageKeys.articles,
    storageKeys.articlesList,
    storageKeys.articlesQuery,
    storageKeys.articleLastVisited,
    storageKeys.projectId,
    storageKeys.draftId,
    storageKeys.query,
    storageKeys.helpdeskQuery,
    storageKeys.lastQueries,
    storageKeys.issuesCache,
    storageKeys.helpdeskCache,
    storageKeys.inboxCache,
    storageKeys.inboxThreadsCache,
    storageKeys.isRegisteredForPush,
    storageKeys.deviceToken,
    storageKeys.helpdeskSearchContext,
    storageKeys.agileZoomedIn,
    storageKeys.agileLastSprint,
    storageKeys.agileQuery,
    storageKeys.lastRoute,
    storageKeys.issueActivitiesEnabledTypes,
    storageKeys.permissions,
    storageKeys.agileDefaultBoard,
    storageKeys.projects,
    storageKeys.issuesSettings,
    storageKeys.helpdeskSettings,
    storageKeys.helpdeskMenuHidden,
    storageKeys.searchContext,
    ...Object.values(tipsKeys),
    ...Object.values(featuresKeys),
  ] as string[]);
  return populateStorage();
}

async function secureAccount(account: StorageState): Promise<boolean> {
  if (
    !account.authParamsKey &&
    account.authParams &&
    account.creationTimestamp
  ) {
    const authStorageStateKey: string = getAuthParamsKey();
    account[authStorageStateKey] = account.creationTimestamp.toString();
    await cacheAuthParamsSecured(
      account.authParams,
      account[authStorageStateKey],
    );
    delete account.authParams;
    return true;
  }

  return false;
}

export async function populateStorage(): Promise<StorageState> {
  const PAIR_KEY = 0;
  const PAIR_VALUE = 1;
  const pairs = await AsyncStorage.multiGet(
    (Object.values(storageKeys) as any) as Array<string>,
  );
  const values = pairs.reduce((acc, pair) => {
    acc[pair[PAIR_KEY]] = pair[PAIR_VALUE];
    return acc;
  }, {});
  const initialStateCopy: StorageState = {...initialState};
  storageState = Object.entries(storageKeys).reduce(
    (state: StorageState, [key, storageKey]) => {
      const value = values[storageKey];

      try {
        state[key] = value ? JSON.parse(value) : value;
      } catch (e) {
        state[key] = value;
      }

      return state;
    },
    initialStateCopy,
  );
  log.info('Storage populated');
  await secureAccount(storageState);
  return storageState;
}
export function getStorageState(): StorageState {
  if (!storageState) {
    throw new Error('Cannot read not yet populated YTM storage');
  }

  return storageState;
}
export async function flushStorage(
  newState: StorageState,
): Promise<StorageState> {
  storageState = {...newState};
  const pairsToRemove = Object.entries(storageState).filter(
    ([key, value]) => !hasValue(value),
  );
  await AsyncStorage.multiRemove(
    pairsToRemove.map(([key]) => storageKeys[key]),
  );
  const pairsToWrite = Object.entries(storageState).filter(([key, value]) =>
    hasValue(value),
  );

  if (pairsToWrite.length === 0) {
    log.info('Storage state is empty, no actual write has been done');
    return newState;
  }

  const pairs: Array<Array<string>> = pairsToWrite.map(([key, value]) => [
    storageKeys[key],
    hasValue(value) ? JSON.stringify(value as any) : (value as any),
  ]);
  await AsyncStorage.multiSet(pairs);
  return storageState;
}
export async function flushStoragePart(
  part: Record<keyof StorageState, any>,
): Promise<StorageState> {
  const currentState: StorageState = getStorageState();
  let newState: Promise<StorageState>;

  try {
    newState = flushStorage({...currentState, ...part});
  } catch (error) {
    newState = new Promise(resolve => resolve(currentState));
    notify(
      i18n(
        'Your mobile device is running low on available storage space. Some app functionality may be unavailable.',
      ),
      10000,
    );
  }

  return newState;
}
export async function cacheAuthParamsSecured(
  authParams: AuthParams | null,
  key: string | null,
): Promise<void> {
  if (authParams && key) {
    await EncryptedStorage.setItem(
      key,
      typeof authParams === 'string' ? authParams : JSON.stringify(authParams),
    );
  }
}
export async function secureAccounts(
  otherAccounts: StorageState[],
): Promise<void> {
  let isNotMigrated: boolean = false;

  for (const account of otherAccounts) {
    const needUpdate = await secureAccount(account);

    if (needUpdate === true) {
      isNotMigrated = true;
    }
  }

  if (isNotMigrated) {
    await storeAccounts(otherAccounts);
  }
}

export async function getOtherAccounts(): Promise<Array<StorageState>> {
  const value: string | null = await AsyncStorage.getItem(OTHER_ACCOUNTS_KEY);
  return value ? JSON.parse(value) : [];
}

export async function storeAccounts(accounts: StorageState[]) {
  await AsyncStorage.setItem(OTHER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

const clearStorage = async () => {
  await EncryptedStorage.removeItem(STORAGE_AUTH_PARAMS_KEY, () => {
    EncryptedStorage.setItem(STORAGE_AUTH_PARAMS_KEY, '');
  });
  await flushStorage(initialState);
  await AsyncStorage.multiRemove(Object.keys(storageKeys));
};


// For tests only!
export async function __setStorageState(state: StorageState | Partial<StorageState>) {
  storageState = state as StorageState;
}

export {
  clearStorage,
};
