import * as PermissionsHelper from 'components/permissions-store/permissions-helper';
import log from 'components/log/log';
import {
  flushStoragePart,
  getOtherAccounts,
  getStorageState,
} from 'components/storage/storage';

import {removeTrailingSlash} from 'util/util';

import type {PermissionCacheItem} from 'types/Permission';
import type {StorageState} from 'components/storage/storage';
import type {User} from 'types/User';

function updateCachedPermissions(
  permissions: PermissionCacheItem[],
): void {
  flushStoragePart({permissions});
}

function getCachedPermissions(): PermissionCacheItem[] | null {
  return getStorageState().permissions;
}

function loadPermissions(
  token_type: string,
  access_token: string,
  permissionsCacheUrl: string,
): Promise<PermissionCacheItem[]> {
  return PermissionsHelper.loadPermissions(
    token_type,
    access_token,
    permissionsCacheUrl,
  );
}

async function targetAccountToSwitchTo(targetBackendUrl: string = ''): Promise<StorageState | null> {
  const url = targetBackendUrl.trim();
  if (!url) {
    return null;
  }

  let targetAccount: StorageState | null = null;
  const targetURL = removeTrailingSlash(url);
  if (targetURL !== removeTrailingSlash(getStorageState()?.config?.backendUrl || '')) {
    const otherAccounts: StorageState[] = await getOtherAccounts();
    targetAccount = otherAccounts.find(
      (account: StorageState) => removeTrailingSlash(account.config?.backendUrl || '') === targetURL
    ) || null;
  }
  if (targetAccount) {
    log.debug('The account to switch is found', url);
  }

  return targetAccount;
}

async function storeYTCurrentUser(user: User): Promise<void> {
  await flushStoragePart({
    currentUser: {...getStorageState().currentUser, ytCurrentUser: user},
  });
}

export {
  getCachedPermissions,
  updateCachedPermissions,
  loadPermissions,
  targetAccountToSwitchTo,
  storeYTCurrentUser,
};
