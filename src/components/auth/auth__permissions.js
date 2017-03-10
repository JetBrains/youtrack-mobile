/* @flow */

type CacheItemProject = {id: string};
type Permission = {key: string};
type PermissionCacheItem = {
  projects: Array<CacheItemProject>,
  projectIds: Array<string>,
  global: Boolean,
  permission: Permission
};

class Permissions {
  permissionsMap: Object;

  constructor(permissionsCache: Array<PermissionCacheItem>) {
    const convertedPermissions = permissionsCache.map(cacheItem => {
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
    if (!projectId) {
      throw new Error(`authPermissions.has was called with invalid projectId = ${projectId}`);
    }
    const hasProject = permission.projectIds.indexOf(projectId) !== -1;

    return hasProject;
  }

  hasEvery(permissionIds: Array<string>, projectId: string) {
    return (permissionIds || []).every(permissionId => this.has(permissionId, projectId));
  }

  hasSome(permissionIds: Array<string>, projectId: string) {
    return (permissionIds || []).some(permissionId => this.has(permissionId, projectId));
  }
}

export type { Permissions };

export default Permissions;
