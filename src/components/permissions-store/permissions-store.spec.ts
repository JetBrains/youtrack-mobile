import PermissionsStore from './permissions-store';

const PER_PROJECT_PERMISSION = 'per-project-permission';
const GLOBAL_PERMISSION = 'global-permission';
const GLOBAL_PERMISSION_TWO = 'global-permission-two';
const PERMITTED_PROJECT_ID = 'permitted-project';

let permissionsStore: PermissionsStore;

describe('PermissionsStore', () => {
  beforeEach(() => {
    permissionsStore = new PermissionsStore(createPermissions());
  });

  it('should map project ids', () => {
    expect(permissionsStore.permissionsMap.get(PER_PROJECT_PERMISSION).projectIds[0]).toEqual(PERMITTED_PROJECT_ID)
  });

  it('should return false if user has no such permission at all', () => {
    expect(permissionsStore.has('non-exist')).toBeFalsy();
  });

  it('should return true if user has global permission', () => {
    expect(permissionsStore.has(GLOBAL_PERMISSION)).toEqual(true);
  });

  it('should return false if user has permission but not in specified project', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION, 'non-exist-project')).toEqual(false);
  });

  it('should return true if user has permission in specified project', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION, PERMITTED_PROJECT_ID)).toEqual(true);
  });

  it('should return TRUE if permission is not global, but at least one project contains it', () => {
    expect(permissionsStore.has(PER_PROJECT_PERMISSION)).toEqual(true);
  });

  it('should return FALSE if permission is not global, and no projects that contain it', () => {
    expect(permissionsStore.has('other-project-permission')).toEqual(false);
  });

  it('should return true if has every permission', () => {
    expect(permissionsStore.hasEvery([GLOBAL_PERMISSION, GLOBAL_PERMISSION_TWO])).toEqual(true);
  });

  it('should return false if has not every permission', () => {
    expect(permissionsStore.hasEvery([GLOBAL_PERMISSION, 'non-exist'])).toEqual(false);
  });

  it('should return true if has some permission', () => {
    expect(permissionsStore.hasSome([GLOBAL_PERMISSION, 'non-exist'])).toEqual(true);
  });

  it('should return fasle if has not some permission', () => {
    expect(permissionsStore.hasSome(['non-exist1', 'non-exist2'])).toEqual(false);
  });
});

function createPermissions() {
  return [
    {
      global: true,
      permission: {
        key: GLOBAL_PERMISSION,
      },
    },
    {
      global: true,
      permission: {
        key: GLOBAL_PERMISSION_TWO,
      },
    },
    {
      permission: {
        key: PER_PROJECT_PERMISSION,
      },
      projects: [
        {
          id: PERMITTED_PROJECT_ID,
        },
      ],
    },
  ];
}
