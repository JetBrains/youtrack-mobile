import type {CachedPermission} from 'types/Permission';

class PermissionsStore {
  permissionsMap: Map<string, CachedPermission> = new Map();

  constructor(permissions: CachedPermission[]) {
    this.createPermissionsMap(permissions);
  }

  createPermissionsMap(permissions: CachedPermission[]) {
    permissions.forEach(p => {
      p.projectIds = p.projects?.map(proj => proj.id) ?? [];
      this.permissionsMap.set(p.id, p);
    });
  }

  has = (permissionId: string, projectId?: string): boolean => {
    const permission = this.permissionsMap.get(permissionId);

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
  };

  hasEvery = (permissionIds: string[], projectId?: string): boolean =>
    (permissionIds || []).every(permissionId => this.has(permissionId, projectId));

  hasSome = (permissionIds: string[], projectId?: string): boolean =>
    (permissionIds || []).some(permissionId => this.has(permissionId, projectId));
}

export type {PermissionsStore};
export default PermissionsStore;
