import type {CacheItemProject, PermissionCacheItem} from 'types/Permission';

class PermissionsStore {
  permissionsMap: Record<string, any>;

  constructor(permissions: PermissionCacheItem[]) {
    const permissionsWithProjects = (Array.isArray(permissions)
      ? permissions
      : []
    ).map((permission: PermissionCacheItem) => {
      permission.projectIds = (permission.projects || []).map(
        (project: CacheItemProject) => project.id,
      );
      return permission;
    });
    this.permissionsMap = new Map(
      permissionsWithProjects.map(it => [it.permission.key, it]),
    );
  }

  has(permissionId: string, projectId?: string): boolean {
    const permission: PermissionCacheItem = this.permissionsMap.get(
      permissionId,
    );

    if (!permission) {
      return false;
    }

    if (permission.global) {
      return true;
    }

    if (projectId) {
      return permission.projectIds.includes(projectId);
    }

    return permission.projectIds.length > 0;
  }

  hasEvery(permissionIds: string[], projectId: string): boolean {
    return (permissionIds || []).every(permissionId =>
      this.has(permissionId, projectId),
    );
  }

  hasSome(permissionIds: string[], projectId: string): boolean {
    return (permissionIds || []).some(permissionId =>
      this.has(permissionId, projectId),
    );
  }
}

export type {PermissionsStore};
export default PermissionsStore;
