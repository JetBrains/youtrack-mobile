import IssuePermissions, {CREATE_ISSUE, READ_ISSUE, UPDATE_ISSUE, CAN_UPDATE_COMMENT, PRIVATE_UPDATE_ISSUE} from './issue-permissions';
import sinon from 'sinon';

import ResourceTypes from '../api/api__resource-types';

describe('IssuePermissions', function () {
  const USER_ID = 'some-user-id';
  const PROJECT_ID = 'some-project-id';

  beforeEach(() => {
    this.permissionsMock = {
      has: sinon.stub().returns(false),
      hasEvery: sinon.stub().returns(false)
    };

    this.issueMock = {
      reporter: {ringId: USER_ID},
      project: {
        ringId: PROJECT_ID,
        plugins: {
          timeTrackingSettings: {
            enabled: false,
            spentTime: undefined
          }
        }
      }
    };

    this.commentMock = {
      author: {
        ringId: USER_ID
      }
    };

    this.fieldMock = {
      projectCustomField: {
        field: {
          id: 'some-field',
          isPublic: true
        }
      }
    };

    this.issuePermissions = new IssuePermissions(this.permissionsMock, {id: USER_ID});
  });

  it('should init', () => {
    this.issuePermissions.should.be.defined;
  });

  describe('canUpdateGeneralInfo', () => {
    it('should allow to edit general info if user is reporter and has READ_ISSUE', () => {
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.true;
    });

    it('should not allow to edit issue if user is not reporter but has READ_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });

    it('should not allow to edit issue if user is reporter but not has READ_ISSUE', () => {
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });

    it('should allow to edit if user is not reporter but has UPDATE_ISSUE and READ_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.permissionsMock.hasEvery.withArgs([READ_ISSUE, UPDATE_ISSUE]).returns(true);

      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.true;
    });

    it('should not allow to edit if user is not reporter but has READ_ISSUE and not has UPDATE_ISSUE', () => {
      this.issueMock.reporter = {id: 'foo'};
      this.issuePermissions.canUpdateGeneralInfo(this.issueMock).should.be.false;
    });
  });

  describe('canEditComment', () => {
    it('should allow to edit own comment if has update permission', () => {
      this.permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);

      this.issuePermissions.canEditComment(this.issueMock, this.commentMock).should.be.true;
    });

    it('should not allow to edit not own comment if don\'t have update-not-own permission', () => {
      this.permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);
      this.commentMock.author = {id: 'foo'};

      this.issuePermissions.canEditComment(this.issueMock, this.commentMock).should.be.false;
    });
  });

  describe('canUpdateField', () => {
    it('should allow to edit public field to reporter even if only CREATE_ISSUE permission', () => {
      this.permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to edit public field if not reporter and has no PRIVATE_UPDATE_ISSUE', () => {
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to edit public field if has PRIVATE_UPDATE_ISSUE', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to update private field if has no PRIVATE_UPDATE_ISSUE', () => {
      this.fieldMock.projectCustomField.field.isPublic = false;
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to update private field if has PRIVATE_UPDATE_ISSUE', () => {
      this.fieldMock.projectCustomField.field.isPublic = false;
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should not allow to edit spentTime field', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = this.issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: this.fieldMock.projectCustomField.field.id}
      };

      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.false;
    });

    it('should allow to edit spentTime field if old youtrack (no "plugins" field in old YT)', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      delete this.issueMock.project.plugins;
      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });

    it('should allow to edit any other time field', () => {
      this.permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = this.issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: 'some-another-field'}
      };

      this.issuePermissions.canUpdateField(this.issueMock, this.fieldMock).should.be.true;
    });
  });


  describe('isSecured', () => {
    it('should return true if an object has limited `visibility` type', () => {
      const entity = createEntity({
        $type: ResourceTypes.VISIBILITY_LIMITED
      });

      IssuePermissions.isSecured(entity).should.be.true;
    });

    it('should return true if an object has `permittedGroups`', () => {
      const entity = createEntity({
          permittedGroups: [{}]
        }
      );

      IssuePermissions.isSecured(entity).should.be.true;
    });

    it('should return true if an object has `permittedUsers`', () => {
      const entity = createEntity({
        permittedUsers: [{}]
      });

      IssuePermissions.isSecured(entity).should.be.true;
    });

    it('should return false if an object has no `visibility`', () => {
      IssuePermissions.isSecured({}).should.be.false;
    });

    it('should return false if an object has no `permittedUsers` and `permittedGroups`', () => {
      IssuePermissions.isSecured(createEntity()).should.be.false;
    });


    function createEntity(visibility) {
      return {
        visibility: visibility || {}
      };
    }
  });


  describe('createVisibility', function() {
    it('should create visibility with empty `permittedUsers` and `permittedGroups` and limited visibility type', () => {
      const visibility = IssuePermissions.createVisibility();

      visibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibility.permittedUsers.length.should.equal(0);
      visibility.permittedGroups.length.should.equal(0);
    });

    it('should create change visibility type to limited but leave `permittedUsers` and `permittedGroups` as is', () => {
      const itemMock = {};
      const visibilityMock = {
        $type: ResourceTypes.VISIBILITY_UNLIMITED,
        permittedUsers: [itemMock],
        permittedGroups: [{}, itemMock]
      };

      const visibility = IssuePermissions.createVisibility(visibilityMock);

      visibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibility.permittedUsers.length.should.equal(1);
      visibility.permittedUsers[0].should.equal(itemMock);
      visibility.permittedGroups.length.should.equal(2);
      visibility.permittedGroups[1].should.equal(itemMock);
    });
  });


  describe('toggleVisibilityOption', function() {
    it('should create a visibility with empty `permittedUsers` and `permittedGroups` and limited visibility type', () => {
      const visibility = IssuePermissions.createVisibility();

      visibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibility.permittedUsers.length.should.equal(0);
      visibility.permittedGroups.length.should.equal(0);
    });

    it('should remove an item from `permittedUsers`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER, id: 'foo'};
      const visibilityMock = {
        permittedUsers: [userMock1, userMock2]
      };

      const visibility = IssuePermissions.toggleVisibilityOption(visibilityMock, userMock2);

      visibility.permittedUsers.length.should.equal(1);
      visibility.permittedUsers[0].should.equal(userMock1);
      visibility.permittedGroups.length.should.equal(0);
    });

    it('should add an item to `permittedUsers`', () => {
      const userMock = {$type: ResourceTypes.USER, id: 'foo'};
      const visibilityMock = {
        permittedUsers: []
      };

      const visibility = IssuePermissions.toggleVisibilityOption(visibilityMock, userMock);

      visibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibility.permittedUsers.length.should.equal(1);
      visibility.permittedUsers[0].id.should.equal(userMock.id);
      visibility.permittedGroups.length.should.equal(0);
    });

    it('should remove an item from `permittedGroup`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER_GROUP, id: 'foo'};
      const visibilityMock = {
        permittedGroups: [userMock1, userMock2]
      };

      const visibility = IssuePermissions.toggleVisibilityOption(visibilityMock, userMock2);

      visibility.permittedGroups.length.should.equal(1);
      visibility.permittedGroups[0].should.equal(userMock1);
      visibility.permittedUsers.length.should.equal(0);
    });

    it('should add an item to `permittedGroup`', () => {
      const userMock = {$type: ResourceTypes.USER_GROUP, id: 'foo'};
      const visibilityMock = {
        permittedGroups: []
      };

      const visibility = IssuePermissions.toggleVisibilityOption(visibilityMock, userMock);

      visibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibility.permittedGroups.length.should.equal(1);
      visibility.permittedGroups[0].should.equal(userMock);
      visibility.permittedUsers.length.should.equal(0);
    });
  });
});
