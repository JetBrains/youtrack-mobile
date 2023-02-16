type Permission = {
  key: string;
};

export type CacheItemProject = {
  id: string;
};

export type PermissionCacheItem = {
  projects: CacheItemProject[];
  projectIds: string[];
  global: Boolean;
  permission: Permission;
};
