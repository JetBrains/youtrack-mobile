import PermissionsStore from './permissions-store';

import type {CachedPermission} from 'types/Permission';

describe('PermissionsStore', () => {
  const PER_PROJECT_PERMISSION = 'per-project-permission';
  const GLOBAL_PERMISSION = 'global-permission';
  const GLOBAL_PERMISSION_TWO = 'global-permission-two';
  const PERMITTED_PROJECT_ID = 'permitted-project';

  const permissionsMock: CachedPermission[] = [
    {
      id: GLOBAL_PERMISSION,
      global: true,
      projectIds: [],
      projects: null,
    },
    {
      id: GLOBAL_PERMISSION_TWO,
      global: true,
      projectIds: [],
      projects: null,
    },
    {
      id: PER_PROJECT_PERMISSION,
      global: false,
      projectIds: [PERMITTED_PROJECT_ID],
      projects: [{id: PERMITTED_PROJECT_ID}],
    },
    {
      id: 'permissionId',
      global: false,
      projectIds: [],
      projects: null,
    },
  ];

  let permissionsStore: PermissionsStore;

  beforeEach(() => {

    permissionsStore = new PermissionsStore(permissionsMock);
  });

  it('should map project ids', () => {
    const permission = permissionsStore.permissionsMap.get(PER_PROJECT_PERMISSION);

    expect(permission).toBeDefined();
    expect(permission!.projectIds[0]).toEqual(PERMITTED_PROJECT_ID);
  });

  it('should return false if a user has no such permission at all', () => {
    expect(permissionsStore.has('non-exist')).toBeFalsy();
  });

  it('should return true if a user has global permission', () => {
    expect(permissionsStore.has(GLOBAL_PERMISSION)).toEqual(true);
  });

  it('should return false if a user has permission but not in specified project', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION, 'non-exist-project')).toEqual(false);
  });

  it('should return true if a user has permission in specified project', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION, PERMITTED_PROJECT_ID)).toEqual(true);
  });

  it('should return TRUE if permission is not global, but at least one project contains it', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION)).toEqual(true);
  });

  it('should return FALSE if permission is not global, and no projects that contain it', () => {
    expect(permissionsStore.has('other-project-permission')).toEqual(false);
  });

  it('should return true if it has every permission', () => {
    expect(permissionsStore.hasEvery([GLOBAL_PERMISSION, GLOBAL_PERMISSION_TWO])).toEqual(true);
  });

  it('should return false if has not every permission', () => {
    expect(permissionsStore.hasEvery([GLOBAL_PERMISSION, 'non-exist'])).toEqual(false);
  });

  it('should return true if it has some permission', () => {
    expect(permissionsStore.hasSome([GLOBAL_PERMISSION, 'non-exist'])).toEqual(true);
  });

  it('should return fasle if it has not some permission', () => {
    expect(permissionsStore.hasSome(['non-exist1', 'non-exist2'])).toEqual(false);
  });
});
