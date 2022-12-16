/* @flow */

import PermissionsHelper from 'components/permissions-store/permissions-helper';
import {flushStoragePart, getOtherAccounts, getStorageState} from 'components/storage/storage';
import {removeTrailingSlash} from 'util/util';

import type {PermissionCacheItem} from 'flow/Permission';
import type {StorageState} from 'components/storage/storage';
import type {User} from '../flow/User';

function updateCachedPermissions(permissions: Array<PermissionCacheItem>): void {
  flushStoragePart({permissions});
}

function getCachedPermissions(): ?Array<PermissionCacheItem> {
  return getStorageState().permissions;
}

function loadPermissions(token_type: string, access_token: string, permissionsCacheUrl: string): Promise<Array<PermissionCacheItem>> {
  return PermissionsHelper.loadPermissions(
    token_type,
    access_token,
    permissionsCacheUrl
  );
}

async function targetAccountToSwitchTo(targetBackendUrl: string = ''): Promise<StorageState | null> {
  if (!targetBackendUrl) {
    return null;
  }

  let targetAccount: StorageState | null = null;
  const storageState: StorageState = getStorageState();

  if (targetBackendUrl && removeTrailingSlash(targetBackendUrl) !== removeTrailingSlash(storageState.config?.backendUrl || '')) {
    const otherAccounts: Array<StorageState> = await getOtherAccounts();
    targetAccount = otherAccounts.find(
      (account: StorageState) => removeTrailingSlash(account.config?.backendUrl || '') === removeTrailingSlash(
        targetBackendUrl
      )
    ) || null;
  }

  return targetAccount;
}

async function storeYTCurrentUser(user: User): Promise<void> {
  await flushStoragePart({
    currentUser: {
      ...getStorageState().currentUser,
      ytCurrentUser: user,
    },
  });
}

export {
  getCachedPermissions,
  updateCachedPermissions,
  loadPermissions,
  targetAccountToSwitchTo,
  storeYTCurrentUser,
};
