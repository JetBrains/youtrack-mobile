/* @flow */
import {AsyncStorage} from 'react-native';

import log from '../log/log';

import type AuthParams from '../auth/auth';
import type {IssueOnList} from '../../flow/Issue';

declare type StorageState = {
  projectId: string,
  draftId: string,
  authParams: AuthParams,
  issues: Array<IssueOnList>,
  config: Object,
  query: string,
  lastQueries: Array<string>
}

const storageKeys = {
  projectId: 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
  draftId: 'DRAFT_ID_STORAGE_KEY',
  authParams: 'yt_mobile_auth',
  issues: 'yt_mobile_issues_cache',
  config: 'BACKEND_CONFIG_STORAGE_KEY',
  query: 'YT_QUERY_STORAGE',
  lastQueries: 'YT_LAST_QUERIES_STORAGE_KEY'
};

let storageState: ?StorageState = null;

export function clearCachesAndDrafts() {
  return AsyncStorage.multiRemove([
    storageKeys.projectId, storageKeys.draftId, storageKeys.query,
    storageKeys.lastQueries, storageKeys.issues
  ]);
}

export async function populateStorage(): Promise<StorageState> {
  const values = await AsyncStorage.multiGet(Object.values(storageKeys));

  storageState = values.reduce((state, [key, value]) => {
    state[key] = value;
    return state;
  }, {});

  log.log('Storage has been populated', storageState);

  return storageState;
}

export function getStorageState(): StorageState {
  if (!storageState) {
    throw new Error('Cannot read not yet populated YTM storage');
  }
  return {...storageState};
}

export async function flushStorage(newState: StorageState) {
  storageState = newState;
  log.log('Flushing storage', storageState);

  return AsyncStorage.
    multiSet(
      Object.entries(storageState)
        .map(([key, value]) => [storageKeys[key], value])
    );
}

export async function flushStoragePart(part: Object) {
  return flushStorage({
    ...getStorageState(),
    ...part
  });
}

