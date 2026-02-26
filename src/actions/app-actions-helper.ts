import log from 'components/log/log';
import {
  flushStoragePart,
  getOtherAccounts,
  getStorageState,
} from 'components/storage/storage';

import {removeTrailingSlash} from 'util/util';

import type {PermissionCacheResponse} from 'components/permissions-store/permissions-helper';
import type {StorageState} from 'components/storage/storage';
import type {YtCurrentUser} from 'types/User';

function updateCachedPermissions(permissions: PermissionCacheResponse | null) {
  flushStoragePart({permissions});
}

function getCachedPermissions(): PermissionCacheResponse | null {
  return getStorageState().permissions;
}

async function targetAccountToSwitchTo(targetBackendUrl: string = '', backendUrl: string): Promise<StorageState | null> {
  const url = targetBackendUrl.trim();
  if (!url) {
    return null;
  }

  let targetAccount: StorageState | null = null;
  const targetURL = removeTrailingSlash(url);
  if (targetURL !== removeTrailingSlash(backendUrl)) {
    const otherAccounts: StorageState[] = await getOtherAccounts();
    targetAccount = otherAccounts.find(
      (account: StorageState) =>
        removeTrailingSlash(account.config?.backendUrl || '').indexOf(targetURL) !== -1
    ) || null;
  }
  if (targetAccount) {
    log.info('App Actions: The account to switch is found');
  }

  return targetAccount;
}

async function storeYTCurrentUser(ytCurrentUser: YtCurrentUser): Promise<void> {
  await flushStoragePart({
    currentUser: {...getStorageState().currentUser, ytCurrentUser},
  });
}

export {
  getCachedPermissions,
  updateCachedPermissions,
  targetAccountToSwitchTo,
  storeYTCurrentUser,
};
