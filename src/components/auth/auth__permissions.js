
class Permissions {
  constructor(permissionsCache) {
    const convertedPermissions = permissionsCache.map(cacheItem => {
      cacheItem.projects = (cacheItem.permission.projects || []).map(project => project.id);
      return cacheItem;
    });

    this.permissionsMap = new Map(convertedPermissions.map(it => [it.permission.key, it]));
  }

  has(permissionId, projectId) {
    const permission = this.permissionsMap.get(permissionId);
    if (!permission) {
      return false;
    }

    if (permission.global) {
      return true;
    }
    const hasProject = permission.projects.indexOf(projectId) !== -1;

    return hasProject;
  }

  hasEvery(permissionIds, projectId) {
    return (permissionIds || []).every(permissionId => this.has(permissionId, projectId));
  }

  hasSome(permissionIds, projectId) {
    return (permissionIds || []).some(permissionId => this.has(permissionId, projectId));
  }
}

export default Permissions;
