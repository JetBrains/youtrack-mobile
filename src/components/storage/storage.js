/* @flow */

import AsyncStorage from '@react-native-community/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

import log from '../log/log';
import {notify} from '../notification/notification';
import {routeMap} from '../../app-routes';

import type {Activity, ActivityType} from '../../flow/Activity';
import type {AnyIssue} from '../../flow/Issue';
import type {AppConfigFilled} from '../../flow/AppConfig';
import type {Article, ArticlesList} from '../../flow/Article';
import type {ArticleProject} from '../../flow/Article';
import type {AuthParams} from '../../flow/Auth';
import type {Board, Sprint} from '../../flow/Agile';
import type {Folder, User} from '../../flow/User';
import type {IssueProject} from '../../flow/CustomFields';
import type {Notification} from '../../flow/Inbox';
import type {PermissionCacheItem} from '../../flow/Permission';

const OTHER_ACCOUNTS_KEY = 'YT_OTHER_ACCOUNTS_STORAGE_KEY';
export const MAX_STORED_QUERIES = 5;
export const STORAGE_AUTH_PARAMS: string = 'yt_mobile_auth';
export const STORAGE_AUTH_PARAMS_KEY: string = 'yt_mobile_auth_key';
export const THEME_MODE_KEY = 'YT_THEME_MODE';

export type StorageState = {|
  articles: ?Array<Article>,
  articlesList: ArticlesList | null,
  articlesQuery: string | null,
  articleLastVisited: { article?: Article, activities?: Array<Activity> } | null,
  authParams: ?AuthParams,
  authParamsKey: ?string,
  projectId: ?string,
  projects: Array<IssueProject | ArticleProject>,
  draftId: ?string,
  currentUser: ?User,
  creationTimestamp: ?number,
  config: ?AppConfigFilled,
  query: ?string,
  searchContext: ?Folder,
  lastQueries: ?Array<string>,
  issuesCache: Array<AnyIssue> | null,
  inboxCache: Array<Notification> | null,
  isRegisteredForPush: boolean,
  deviceToken: ?string,
  agileZoomedIn: ?boolean,
  agileLastSprint: ?Sprint,
  agileDefaultBoard: ?Board,
  agileQuery: ?string,
  lastRoute: ?(typeof routeMap.Issues | typeof routeMap.Inbox | typeof routeMap.AgileBoard | typeof routeMap.KnowledgeBase | typeof routeMap.ArticleSingle),
  currentAppVersion: ?string,
  issueActivitiesEnabledTypes: ?Array<ActivityType>,
  permissions: ?Array<PermissionCacheItem>,
  themeMode: ?string,
  vcsChanges: boolean | null,
|}

type StorageStateKeys = $Shape<$ObjMap<StorageState, () => string>>;

const storageKeys: StorageStateKeys = {
  articles: 'YT_ARTICLES',
  articlesList: 'YT_ARTICLES_LIST',
  articlesQuery: 'YT_ARTICLES_QUERY',
  articleLastVisited: 'YT_ARTICLE_LAST_VISITED',
  authParams: STORAGE_AUTH_PARAMS,
  authParamsKey: STORAGE_AUTH_PARAMS_KEY,
  projectId: 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
  projects: 'YT_PROJECTS_STORAGE',
  draftId: 'DRAFT_ID_STORAGE_KEY',
  currentUser: 'YT_CURRENT_USER_STORAGE_KEY',
  config: 'BACKEND_CONFIG_STORAGE_KEY',
  creationTimestamp: 'YT_CREATION_TIMESTAMP_STORAGE_KEY',
  query: 'YT_QUERY_STORAGE',
  searchContext: 'YT_SEARCH_CONTEXT_STORAGE',
  lastQueries: 'YT_LAST_QUERIES_STORAGE_KEY',
  issuesCache: 'yt_mobile_issues_cache',
  inboxCache: 'YT_INBOX_CACHE',
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
};

let storageState: ?StorageState = null;

const hasValue = (v: any): boolean => v !== null && v !== undefined;

export const initialState: StorageState = Object.freeze({
  articles: null,
  articlesList: null,
  articlesQuery: null,
  articleLastVisited: null,
  authParams: null,
  authParamsKey: null,
  projectId: null,
  projects: [],
  draftId: null,
  currentUser: null,
  creationTimestamp: null,
  config: null,
  query: null,
  searchContext: null,
  lastQueries: null,
  issuesCache: null,
  inboxCache: null,
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
});

function cleanAndLogState(message, state: StorageState) {
  const CENSORED: string = 'CENSORED';
  const config: ?$Shape<AppConfigFilled> = state?.config ? {
    ...state.config,
    backendUrl: state.config.backendUrl,
    auth: state.config.auth ? {
      serverUri: state.config.auth.serverUri,
      scopes: state.config.auth.scopes,
    } : undefined,
    statisticsEnabled: state.config.statisticsEnabled,
    version: state.config.version,
  } : undefined;

  log.debug(message, {
    ...state,
    ...(state?.agileLastSprint ? {agileLastSprint: state.agileLastSprint.id} : undefined),
    ...(state?.articleLastVisited ? {articleLastVisited: state.articleLastVisited.id} : undefined),
    ...(state?.articlesList ? {articlesList: state.articlesList.length} : undefined),
    ...(state?.currentUser ? {currentUser: state.currentUser.guest} : undefined),
    ...{config},
    ...(state?.projects ? {projects: state.projects.length} : undefined),
    ...(state?.permissions ? {permissions: state.permissions.length} : undefined),
    issuesCache: CENSORED,
    inboxCache: CENSORED,
  });
}

export async function clearCachesAndDrafts(): Promise<StorageState> {
  log.debug('Storage drafts has been cleared');
  await AsyncStorage.multiRemove([
    storageKeys.articles,
    storageKeys.articlesList,
    storageKeys.articlesQuery,
    storageKeys.articleLastVisited,
    storageKeys.projectId,
    storageKeys.draftId,
    storageKeys.query,
    storageKeys.lastQueries,
    storageKeys.issuesCache,
    storageKeys.inboxCache,
    storageKeys.isRegisteredForPush,
    storageKeys.deviceToken,
    storageKeys.agileZoomedIn,
    storageKeys.agileLastSprint,
    storageKeys.agileQuery,
    storageKeys.lastRoute,
    storageKeys.issueActivitiesEnabledTypes,
    storageKeys.permissions,
    storageKeys.agileDefaultBoard,
    storageKeys.projects,
  ]);
  return populateStorage();
}

async function secureAccount(account: StorageState): Promise<boolean> {
  if (!account.authParamsKey && account.authParams && account.creationTimestamp) {
    account.authParamsKey = account.creationTimestamp.toString();
    await cacheAuthParamsSecured(account.authParams, account.authParamsKey);
    delete account.authParams;
    return true;
  }
  return false;
}

export async function populateStorage(): Promise<StorageState> {
  const PAIR_KEY = 0;
  const PAIR_VALUE = 1;

  const pairs = await AsyncStorage.multiGet(((Object.values(storageKeys): any): Array<string>));
  const values = pairs.reduce((acc, pair) => {
    acc[pair[PAIR_KEY]] = pair[PAIR_VALUE];
    return acc;
  }, {});


  // $FlowFixMe Flow doesn't get that it is the same object
  const initialStateCopy: StorageState = {...initialState};

  storageState = Object.entries(storageKeys)
    .reduce((state: StorageState, [key: string, storageKey: string]) => {
      const value = values[storageKey];
      try {
        state[key] = value ? JSON.parse(value) : value;
      } catch (e) {
        state[key] = value;
      }
      return state;
    }, initialStateCopy);

  cleanAndLogState('Storage populated', storageState);
  await secureAccount(storageState);
  return storageState;
}

export function getStorageState(): StorageState {
  if (!storageState) {
    throw new Error('Cannot read not yet populated YTM storage');
  }
  return storageState;
}

export async function flushStorage(newState: StorageState): Promise<StorageState> {
  // $FlowFixMe Flow doesn't get that it is the same object
  storageState = {...newState};

  const pairsToRemove = Object.entries(storageState)
    .filter(([key, value]) => !hasValue(value));
  await AsyncStorage.multiRemove(pairsToRemove.map((([key]) => storageKeys[key])));

  const pairsToWrite = Object.entries(storageState)
    .filter(([key, value]) => hasValue(value));

  if (pairsToWrite.length === 0) {
    log.debug('Storage state is empty, no actual write has been done');
    return newState;
  }

  const pairs: Array<Array<string>> = pairsToWrite.map(
    ([key, value]) => [
      storageKeys[key],
      hasValue(value) ? JSON.stringify((value: any)) : (value: any),
    ]
  );
  await AsyncStorage.multiSet(pairs);

  return storageState;
}

export async function flushStoragePart(part: Object): Promise<StorageState> {
  const currentState: StorageState = getStorageState();
  let newState: Promise<StorageState>;
  try {
    cleanAndLogState('Flushing storage part');
    newState = flushStorage({
      ...currentState,
      ...part,
    });
  } catch (error) {
    newState = new Promise(resolve => resolve(currentState));
    notify(
      'Your mobile device is running low on available storage space. Some app functionality may be unavailable.',
      error,
      10000
    );
  }
  return newState;
}

export async function cacheAuthParamsSecured(authParams: ?AuthParams, key: ?string): Promise<void> {
  if (authParams && key) {
    await EncryptedStorage.setItem(key, typeof authParams === 'string' ? authParams : JSON.stringify(authParams));
  }
}

export async function secureAccounts(otherAccounts: Array<StorageState>): Promise<void> {
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
  const value: string = await AsyncStorage.getItem(OTHER_ACCOUNTS_KEY);
  const otherAccounts: Array<StorageState> = value ? JSON.parse(value) : [];
  await secureAccounts(otherAccounts);
  return otherAccounts;
}

export async function storeAccounts(accounts: Array<StorageState>) {
  await AsyncStorage.setItem(OTHER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// For tests only!
export async function __setStorageState(state: StorageState) {
  storageState = state;
}

export function getAuthParamsKey(): string {
  const state: StorageState = getStorageState();
  return ((state.authParamsKey: any): string);
}

export async function storeAuthParams(authParams: AuthParams, key?: string): Promise<AuthParams> {
  const authParamsKey: string = key || getAuthParamsKey();
  if (authParamsKey && authParams) {
    await EncryptedStorage.setItem(authParamsKey, JSON.stringify(authParams));
  }
  return authParams;
}

export async function getStoredAuthParams(key: ?string): Promise<AuthParams | null> {
  const authParamsKey: string = key || getAuthParamsKey();
  if (authParamsKey) {
    const authParams: ?string = await EncryptedStorage.getItem(authParamsKey);
    return typeof authParams === 'string' ? JSON.parse(authParams) : null;
  }
  return null;
}
