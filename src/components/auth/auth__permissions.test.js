import Permissions from './auth__permissions';

describe('Permissions', () => {

  beforeEach(() => {
    this.fakePermissionsCache = [
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

    this.permissions = new Permissions(this.fakePermissionsCache);
  });

  it('should create instance', () => {
    this.permissions.should.be.defined;
  });

  it('should map project ids', () => {
    this.permissions.permissionsMap.get('per-project-permission').projects[0].should.equal('permitted-project');
  })

  it('should return false if user has no such permission at all', () => {
    this.permissions.has('non-exist').should.be.false;
  });

  it('should return true if user has global permission', () => {
    this.permissions.has('global-permission').should.be.true;
  });

  it('should return false if user has permission but not in specified project', () => {
    this.permissions.has('per-project-permission', 'non-exist-project').should.be.false;
  });

  it('should return true if user has permission in specified project', () => {
    this.permissions.has('per-project-permission', 'permitted-project').should.be.true;
  });

  it('should return false if permission is not global and project is not specified', () => {
    this.permissions.has('per-project-permission').should.be.false;
  });

  it('should return true if has every permission', () => {
    this.permissions.hasEvery(['global-permission', 'global-permission-two']).should.be.true;
  });

  it('should return false if has not every permission', () => {
    this.permissions.hasEvery(['global-permission', 'non-exist']).should.be.flse;
  });

  it('should return true if has some permission', () => {
    this.permissions.hasSome(['global-permission', 'non-exist']).should.be.true;
  });

  it('should return fasle if has not some permission', () => {
    this.permissions.hasSome(['non-exist1', 'non-exist2']).should.be.false;
  });
});
