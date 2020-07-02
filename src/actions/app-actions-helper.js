/* @flow */

import log from '../components/log/log';
import {flushStoragePart, getStorageState} from '../components/storage/storage';
import {notify} from '../components/notification/notification';
import PermissionsHelper from '../components/permissions-store/permissions-helper';

import type {PermissionCacheItem} from '../flow/Permission';

async function set(permissions: ?Array<PermissionsHelper>): Promise<?Array<PermissionCacheItem>> {
  await flushStoragePart({permissions});
  return permissions;
}

function get(): ?Array<PermissionCacheItem> {
  return getStorageState().permissions;
}

async function loadPermissions(token_type: ?string, access_token: ?string, permissionsCacheUrl: string): Promise<Array<PermissionCacheItem>> {
  let permissions: Array<PermissionCacheItem> = [];

  try {
    permissions = PermissionsHelper.loadPermissions(
      token_type,
      access_token,
      permissionsCacheUrl
    );
    log.info('PermissionsStore loaded', permissions);
  } catch (error) {
    const errorMessage: string = 'Failed to load permissions. You\'re unable to make any changes.';
    notify(errorMessage, 7000);
    log.warn(errorMessage, error);
  }

  return permissions;
}

export {
  set,
  get,
  loadPermissions,
};
