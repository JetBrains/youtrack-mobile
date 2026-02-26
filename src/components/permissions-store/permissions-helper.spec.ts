import * as featureHelper from 'components/feature/feature-helper';
import PermissionsStore from './permissions-store';
import {getPermissionCacheURL, normalizePermissions, createPermissionsStore} from './permissions-helper';
import {defined} from 'test/test-utils';

import type {CachedPermission, PermissionCacheItem} from 'types/Permission';

describe('permissions-helper', () => {
  const YT_URL = 'https://youtrack.example.com';
  const HUB_URL = `${YT_URL}/hub`;

  const permissionKey = 'permissionKey';
  const projectId = 'project-1';

  const legacyPermissionMock: PermissionCacheItem = {
    global: true,
    permission: {key: permissionKey},
    projects: undefined,
  };

  const legacyPermissionWithProjectMock: PermissionCacheItem = {
    global: false,
    permission: {key: permissionKey},
    projects: [{id: projectId}],
  };

  const permissionMock: CachedPermission = {
    id: permissionKey,
    global: true,
    projectIds: [],
    projects: null,
  };

  describe('getPermissionCacheURL', () => {
    it('should return YT URL with new cache endpoint when cache is from YT', () => {
      jest.spyOn(featureHelper, 'isPermissionCacheInYT').mockReturnValue(true);

      expect(getPermissionCacheURL(HUB_URL, YT_URL)).toEqual('https://youtrack.example.com/api/permissions/cache');
    });

    it('should return Hub URL with legacy cache endpoint when cache is from Hub', () => {
      jest.spyOn(featureHelper, 'isPermissionCacheInYT').mockReturnValue(false);

      expect(getPermissionCacheURL(HUB_URL, YT_URL)).toEqual(
        'https://youtrack.example.com/hub/api/rest/permissions/cache',
      );
    });
  });

  describe('normalizePermissions', () => {
    it('should return an empty array for empty input', () => {
      expect(normalizePermissions([])).toEqual([]);
    });

    it('should transform legacy format: extract id from `permission.key`', () => {
      const result = normalizePermissions([legacyPermissionMock]);

      expect(result[0].id).toEqual(permissionKey);
    });

    it('should transform legacy format: copy `global` flag', () => {
      const result = normalizePermissions([legacyPermissionMock]);

      expect(result[0].global).toBe(true);
    });

    it('should transform legacy format: set `projects` to null when `projects` is `undefined`', () => {
      const result = normalizePermissions([legacyPermissionMock]);

      expect(result[0].projects).toBeNull();
    });

    it('should transform legacy format: carry `projects` array when present', () => {
      const result = normalizePermissions([legacyPermissionWithProjectMock]);

      expect(result[0].projects).toEqual([{id: projectId}]);
    });

    it('should return new format as-is', () => {
      const newPermissions: CachedPermission[] = [permissionMock];

      expect(normalizePermissions(newPermissions)).toBe(newPermissions);
    });

    it('should handle multiple legacy items', () => {
      const legacyPermissions: PermissionCacheItem[] = [
        legacyPermissionMock,
        {global: false, permission: {key: 'other'}, projects: [{id: projectId}]},
      ];

      const result = normalizePermissions(legacyPermissions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual(permissionKey);
      expect(result[1].id).toEqual('other');
    });
  });

  describe('createPermissionsStore', () => {
    it('should always return a PermissionsStore instance', () => {
      expect(createPermissionsStore([permissionMock])).toBeInstanceOf(PermissionsStore);
      expect(createPermissionsStore([legacyPermissionMock])).toBeInstanceOf(PermissionsStore);
    });

    it('should derive `projectIds` from `projects` for legacy format', () => {
      const store = createPermissionsStore([legacyPermissionWithProjectMock]);

      expect(defined(store.permissionsMap.get(permissionKey)).projectIds).toEqual([projectId]);
    });

    it('should derive `projectIds` from `projects` for new format', () => {
      const newPermissionWithProject: CachedPermission = {
        id: permissionKey,
        global: false,
        projectIds: [],
        projects: [{id: projectId}],
      };

      const store = createPermissionsStore([newPermissionWithProject]);

      expect(defined(store.permissionsMap.get(permissionKey)).projectIds).toEqual([projectId]);
    });

    it('should set `projectIds` to [] when `projects` is null', () => {
      const store = createPermissionsStore([permissionMock]);

      expect(defined(store.permissionsMap.get(permissionKey)).projectIds).toEqual([]);
    });

    it('should handle empty array', () => {
      const store = createPermissionsStore([]);

      expect(store).toBeInstanceOf(PermissionsStore);
      expect(store.permissionsMap.size).toBe(0);
    });
  });
});
