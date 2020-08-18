/* @flow */
'use strict';

import AsyncStorage from '@react-native-community/async-storage';

import log from '../log/log';
import {notify} from '../notification/notification';

import type {AppConfigFilled} from '../../flow/AppConfig';
import type {AuthParams} from '../../flow/Auth';
import type {Folder, User} from '../../flow/User';
import type {IssueOnList} from '../../flow/Issue';
import type {Board, Sprint} from '../../flow/Agile';
import type {PermissionCacheItem} from '../../flow/Permission';

const OTHER_ACCOUNTS_KEY = 'YT_OTHER_ACCOUNTS_STORAGE_KEY';

export type StorageState = {|
  projectId: ?string,
  projects: Array<?string>,
  draftId: ?string,
  authParams: ?AuthParams,
  currentUser: ?User,
  creationTimestamp: ?number,
  config: ?AppConfigFilled,
  query: ?string,
  searchContext: ?Folder,
  lastQueries: ?Array<string>,
  issuesCache: ?Array<IssueOnList>,
  isRegisteredForPush: boolean,
  deviceToken: ?string,
  agileZoomedIn: ?boolean,
  agileLastSprint: ?Sprint,
  agileDefaultBoard: ?Board,
  lastRoute: ?('IssueList' | 'Inbox' | 'AgileBoard'),
  currentAppVersion: ?string,
  issueActivitiesEnabledTypes: ?Array<Object>,
  permissions: ?Array<PermissionCacheItem>
|}

type StorageStateKeys = $Exact<$ObjMap<StorageState, () => string>>;

const storageKeys: StorageStateKeys = {
  projectId: 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
  projects: 'YT_PROJECTS_STORAGE',
  draftId: 'DRAFT_ID_STORAGE_KEY',
  authParams: 'yt_mobile_auth',
  currentUser: 'YT_CURRENT_USER_STORAGE_KEY',
  config: 'BACKEND_CONFIG_STORAGE_KEY',
  creationTimestamp: 'YT_CREATION_TIMESTAMP_STORAGE_KEY',
  query: 'YT_QUERY_STORAGE',
  searchContext: 'YT_SEARCH_CONTEXT_STORAGE',
  lastQueries: 'YT_LAST_QUERIES_STORAGE_KEY',
  issuesCache: 'yt_mobile_issues_cache',
  isRegisteredForPush: 'YT_IS_REGISTERED_FOR_PUSH',
  deviceToken: 'YT_DEVICE_TOKEN',
  agileZoomedIn: 'YT_AGILE_ZOOMED_IN',
  agileLastSprint: 'YT_AGILE_LAST_SPRINT',
  agileDefaultBoard: 'YT_AGILE_DEFAULT_BOARD',
  lastRoute: 'YT_LAST_ROUTE',
  currentAppVersion: 'YT_CURRENT_APP_VERSION',
  issueActivitiesEnabledTypes: 'YT_ISSUE_ACTIVITIES_ENABLED_TYPES',
  permissions: 'YT_USER_PERMISSIONS'
};

let storageState: ?StorageState = null;

const hasValue = v => v !== null && v !== undefined;

export const initialState: StorageState = Object.freeze({
  projectId: null,
  projects: [],
  draftId: null,
  authParams: null,
  currentUser: null,
  creationTimestamp: null,
  config: null,
  query: null,
  searchContext: null,
  lastQueries: null,
  issuesCache: null,
  isRegisteredForPush: false,
  deviceToken: null,
  agileZoomedIn: null,
  agileLastSprint: null,
  lastRoute: null,
  currentAppVersion: null,
  issueActivitiesEnabledTypes: null,
  permissions: null,
  agileDefaultBoard: null
});

function cleanAndLogState(message, state) {
  const CENSORED = 'CENSORED';
  const forLog = {...state};

  if (forLog.authParams) {
    forLog.authParams = {
      ...forLog.authParams,
      access_token: CENSORED,
      refresh_token: CENSORED,
    };
  }

  if (forLog.issuesCache) {
    forLog.issuesCache = CENSORED;
  }

  log.debug(message, forLog);
}

export async function clearCachesAndDrafts() {
  log.debug('Storage drafts has been cleared');
  await AsyncStorage.multiRemove([
    storageKeys.projectId,
    storageKeys.draftId,
    storageKeys.query,
    storageKeys.lastQueries,
    storageKeys.issuesCache,
    storageKeys.isRegisteredForPush,
    storageKeys.deviceToken,
    storageKeys.agileZoomedIn,
    storageKeys.agileLastSprint,
    storageKeys.lastRoute,
    storageKeys.issueActivitiesEnabledTypes,
    storageKeys.permissions,
    storageKeys.agileDefaultBoard,
    storageKeys.projects
  ]);
  return populateStorage();
}

export async function populateStorage(): Promise<StorageState> {
  const PAIR_KEY = 0;
  const PAIR_VALUE = 1;

  const pairs = await AsyncStorage.multiGet(Object.values(storageKeys));
  const values = pairs.reduce((acc, pair) => {
    acc[pair[PAIR_KEY]] = pair[PAIR_VALUE];
    return acc;
  }, {});


  // $FlowFixMe Flow doesn't get that it is the same object
  const initialStateCopy: StorageState = {...initialState};

  storageState = Object.entries(storageKeys)
    .reduce((state, [key, storageKey]) => {
      const value = values[storageKey];
      try {
        state[key] = value ? JSON.parse(value) : value;
      } catch (e) {
        state[key] = value;
      }
      return state;
    }, initialStateCopy);

  cleanAndLogState('Storage populated', storageState);

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
    .filter(([key, value]) => value !== null && value !== undefined);

  if (pairsToWrite.length === 0) {
    log.debug('Storage state is empty, no actuall write has been done');
    return newState;
  }

  const pairs = pairsToWrite
    .map(([key, value]) => [storageKeys[key], hasValue(value) ? JSON.stringify(value) : value]);
  await AsyncStorage.multiSet(pairs);

  return storageState;
}

export async function flushStoragePart(part: Object): Promise<StorageState> {
  const currentState: StorageState = getStorageState();
  let newState: Promise<StorageState>;
  try {
    cleanAndLogState('Flushing storage part', part);
    newState = flushStorage({
      ...currentState,
      ...part
    });
  } catch (error) {
    newState = new Promise(resolve => resolve(currentState));
    notify('Your mobile device is running low on available storage space. Some app functionality may be unavailable.', error, 10000);
  }
  return newState;
}

export async function getOtherAccounts(): Promise<Array<StorageState>> {
  const stored = await AsyncStorage.getItem(OTHER_ACCOUNTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function storeAccounts(accounts: Array<StorageState>) {
  await AsyncStorage.setItem(OTHER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// For tests only!
export async function __setStorageState(state: StorageState) {
  storageState = state;
}
