import PermissionsStore from 'components/permissions-store/permissions-store';
import {isPermissionCacheInYT} from 'components/feature/feature-helper';

import type {CachedPermission, PermissionCacheItem} from 'types/Permission';

const ACCEPT_HEADER = 'application/json, text/plain, */*';

export type PermissionCacheResponse = CachedPermission[] | PermissionCacheItem[];

async function loadPermissions(
  token_type: string,
  access_token: string,
  permissionsCacheUrl: string,
): Promise<PermissionCacheResponse> {
  return fetch(permissionsCacheUrl, {
    headers: {
      Accept: ACCEPT_HEADER,
      'User-Agent': 'USER_AGENT',
      Authorization: `${token_type} ${access_token}`,
    },
  })
    .then(res => res.json())
    .then(response => {
      if ('error' in response) {
        throw response;
      }
      return response;
    })
    .catch(err => {
      throw err;
    });
}

function getPermissionCacheURL(hubURL: string, ytURL: string): string {
  const isNewCache = isPermissionCacheInYT();
  const url = isNewCache ? ytURL : hubURL;
  return `${url}${isNewCache ? '/api/permissions/cache' : '/api/rest/permissions/cache'}`;
}

function normalizePermissions(permissions: PermissionCacheResponse): CachedPermission[] {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return [];
  }
  const p0 = permissions[0];
  if ('permission' in p0 && p0.permission != null && 'key' in p0.permission) {
    return (permissions as PermissionCacheItem[]).map(p => ({
      id: p.permission.key,
      global: p.global,
      projectIds: [],
      projects: p.projects ?? null,
    }));
  }
  return permissions as CachedPermission[];
}

function createPermissionsStore(permissions: PermissionCacheResponse): PermissionsStore {
  return new PermissionsStore(normalizePermissions(permissions));
}

export {
  loadPermissions,
  getPermissionCacheURL,
  normalizePermissions,
  createPermissionsStore,
};
