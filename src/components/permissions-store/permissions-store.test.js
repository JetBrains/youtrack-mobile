import PermissionsStore from './permissions-store';

describe('PermissionsStore', () => {

  beforeEach(() => {
    this.permissionsStore = new PermissionsStore(createPermissions());
  });

  it('should create instance', () => {
    this.permissionsStore.should.be.defined;
  });

  it('should map project ids', () => {
    this.permissionsStore.permissionsMap.get('per-project-permission').projectIds[0].should.equal('permitted-project');
  });

  it('should return false if user has no such permission at all', () => {
    this.permissionsStore.has('non-exist').should.be.false;
  });

  it('should return true if user has global permission', () => {
    this.permissionsStore.has('global-permission').should.be.true;
  });

  it('should return false if user has permission but not in specified project', () => {
    this.permissionsStore.has('per-project-permission', 'non-exist-project').should.be.false;
  });

  it('should return true if user has permission in specified project', () => {
    this.permissionsStore.has('per-project-permission', 'permitted-project').should.be.true;
  });

  it('should return false if permission is not global and project is not specified', () => {
    this.permissionsStore.has('per-project-permission').should.be.false;
  });

  it('should return true if has every permission', () => {
    this.permissionsStore.hasEvery(['global-permission', 'global-permission-two']).should.be.true;
  });

  it('should return false if has not every permission', () => {
    this.permissionsStore.hasEvery(['global-permission', 'non-exist']).should.be.false;
  });

  it('should return true if has some permission', () => {
    this.permissionsStore.hasSome(['global-permission', 'non-exist']).should.be.true;
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
        key: 'global-permission'
      }
    }, {
      global: true,
      permission: {
        key: 'global-permission-two'
      }
    }, {
      permission: {
        key: 'per-project-permission'
      },
      projects: [
        {id: 'permitted-project'}
      ]
    }
  ];
}
