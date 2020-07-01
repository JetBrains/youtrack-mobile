/* @flow */

import type {PermissionCacheItem} from '../../flow/Permission';

class PermissionsStore {
  permissionsMap: Object;

  constructor(permissionsCache: Array<PermissionCacheItem>) {
    const convertedPermissions = (permissionsCache || []).map(cacheItem => {
      cacheItem.projectIds = (cacheItem.projects || []).map(project => project.id);
      return cacheItem;
    });

    this.permissionsMap = new Map(convertedPermissions.map(it => [it.permission.key, it]));
  }

  has(permissionId: string, projectId: string) {
    const permission: PermissionCacheItem = this.permissionsMap.get(permissionId);
    if (!permission) {
      return false;
    }

    if (permission.global) {
      return true;
    }

    return permission.projectIds.indexOf(projectId) !== -1;
  }

  hasEvery(permissionIds: Array<string>, projectId: string) {
    return (permissionIds || []).every(permissionId => this.has(permissionId, projectId));
  }

  hasSome(permissionIds: Array<string>, projectId: string) {
    return (permissionIds || []).some(permissionId => this.has(permissionId, projectId));
  }
}

export type { PermissionsStore };

export default PermissionsStore;
