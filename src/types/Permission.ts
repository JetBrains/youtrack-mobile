type CacheItemProject = {
  id: string;
};
type Permission = {
  key: string;
};
export type PermissionCacheItem = {
  projects: CacheItemProject[];
  projectIds: string[];
  global: Boolean;
  permission: Permission;
};
