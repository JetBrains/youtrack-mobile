import type {PermissionCacheItem} from 'types/Permission';
import type {IssueProject} from 'types/CustomFields';

class PermissionsStore {
  permissionsMap: Record<string, any>;

  constructor(permissions: Array<PermissionCacheItem>) {
    const permissionsWithProjects = (Array.isArray(permissions)
      ? permissions
      : []
    ).map((permission: PermissionCacheItem) => {
      permission.projectIds = (permission.projects || []).map(
        (project: IssueProject) => project.id,
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

  hasEvery(permissionIds: Array<string>, projectId: string): boolean {
    return (permissionIds || []).every(permissionId =>
      this.has(permissionId, projectId),
    );
  }

  hasSome(permissionIds: Array<string>, projectId: string): boolean {
    return (permissionIds || []).some(permissionId =>
      this.has(permissionId, projectId),
    );
  }
}

export type {PermissionsStore};
export default PermissionsStore;
