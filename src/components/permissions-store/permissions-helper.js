/* @flow */

import type {PermissionCacheItem} from 'flow/Permission';

const ACCEPT_HEADER = 'application/json, text/plain, */*';

function getPermissionsCache(token_type: string, access_token: string, permissionsCacheUrl: string) {
  return fetch(permissionsCacheUrl, {
    headers: {
      'Accept': ACCEPT_HEADER,
      'User-Agent': 'USER_AGENT',
      'Authorization': `${token_type} ${access_token}`,
    },
  });
}

async function loadPermissions(token_type: string, access_token: string, permissionsCacheUrl: string): Promise<Array<PermissionCacheItem>> {
  return getPermissionsCache(token_type, access_token, permissionsCacheUrl)
    .then((res) => res.json())
    .then((permissions: Array<PermissionCacheItem>) => {
      return permissions;
    })
    .catch(async err => {
      return err;
    });
}

export default {
  loadPermissions,
};
