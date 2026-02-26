export interface PermissionCacheItem {
  global: boolean;
  permission: {
    key: string;
  };
  projects: Array<{id: string}> | undefined;
}

export interface CachedPermission {
  global: boolean;
  id: string;
  projectIds: string[];
  projects: Array<{id: string}> | null;
}
