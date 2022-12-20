import PermissionsStore from './permissions-store';
const PER_PROJECT_PERMISSION = 'per-project-permission';
const GLOBAL_PERMISSION = 'global-permission';
const GLOBAL_PERMISSION_TWO = 'global-permission-two';
const PERMITTED_PROJECT_ID = 'permitted-project';
describe('PermissionsStore', () => {
  beforeEach(() => {
    this.permissionsStore = new PermissionsStore(createPermissions());
  });
  it('should create instance', () => {
    this.permissionsStore.should.be.defined;
  });
  it('should map project ids', () => {
    this.permissionsStore.permissionsMap
      .get(PER_PROJECT_PERMISSION)
      .projectIds[0].should.equal(PERMITTED_PROJECT_ID);
  });
  it('should return false if user has no such permission at all', () => {
    this.permissionsStore.has('non-exist').should.be.false;
  });
  it('should return true if user has global permission', () => {
    this.permissionsStore.has(GLOBAL_PERMISSION).should.be.true;
  });
  it('should return false if user has permission but not in specified project', () => {
    this.permissionsStore.has(PER_PROJECT_PERMISSION, 'non-exist-project')
      .should.be.false;
  });
  it('should return true if user has permission in specified project', () => {
    this.permissionsStore.has(PER_PROJECT_PERMISSION, PERMITTED_PROJECT_ID)
      .should.be.true;
  });
  it('should return TRUE if permission is not global, but at least one project contains it', () => {
    this.permissionsStore.has(PER_PROJECT_PERMISSION).should.be.true;
  });
  it('should return FALSE if permission is not global, and no projects that contain it', () => {
    this.permissionsStore.has('other-project-permission').should.be.false;
  });
  it('should return true if has every permission', () => {
    this.permissionsStore.hasEvery([GLOBAL_PERMISSION, GLOBAL_PERMISSION_TWO])
      .should.be.true;
  });
  it('should return false if has not every permission', () => {
    this.permissionsStore.hasEvery([GLOBAL_PERMISSION, 'non-exist']).should.be
      .false;
  });
  it('should return true if has some permission', () => {
    this.permissionsStore.hasSome([GLOBAL_PERMISSION, 'non-exist']).should.be
      .true;
  });
  it('should return fasle if has not some permission', () => {
    this.permissionsStore.hasSome(['non-exist1', 'non-exist2']).should.be.false;
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
