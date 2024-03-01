export type CacheItemProject = {
  id: string;
};

export type PermissionCacheItem = {
  global: boolean;
  permission: {
    key: string;
  };
  projectIds: string[];
  projects: CacheItemProject[];
};
