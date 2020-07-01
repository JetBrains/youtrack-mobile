/* @flow */

type CacheItemProject = { id: string };
type Permission = { key: string };

export type PermissionCacheItem = {
  projects: Array<CacheItemProject>,
  projectIds: Array<string>,
  global: Boolean,
  permission: Permission
};
