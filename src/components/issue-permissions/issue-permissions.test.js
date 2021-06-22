import IssuePermissions, {
  CREATE_ISSUE,
  READ_ISSUE,
  UPDATE_ISSUE,
  CAN_UPDATE_COMMENT,
  PRIVATE_UPDATE_ISSUE,
  CAN_UPDATE_NOT_OWN_COMMENT,
  UPDATE_ARTICLE_COMMENT,
  CREATE_ARTICLE_COMMENT,
  UPDATE_ARTICLE,
} from './issue-permissions';
import sinon from 'sinon';

import mocks from '../../../test/mocks';
import {issuePermissionsNull} from './issue-permissions-helper';

describe('IssuePermissions', function () {
  const USER_ID = 'some-user-id';
  const PROJECT_ID = 'some-project-id';
  let currentUserMock;
  let issuePermissions;
  let permissionsMock;
  let issueMock;
  let commentMock;
  let fieldMock;

  beforeEach(() => {
    permissionsMock = {
      has: sinon.stub().returns(false),
      hasEvery: sinon.stub().returns(false),
    };

    issueMock = {
      reporter: {ringId: USER_ID},
      project: {
        ringId: PROJECT_ID,
        plugins: {
          timeTrackingSettings: {
            enabled: false,
            spentTime: undefined,
          },
        },
      },
    };

    commentMock = {
      author: {
        ringId: USER_ID,
      },
    };

    fieldMock = {
      projectCustomField: {
        isPublic: true,
        field: {
          id: 'some-field',
        },
      },
    };

    currentUserMock = {id: USER_ID, guest: false};
    issuePermissions = createInstance(permissionsMock, currentUserMock);
  });

  it('should init', () => {
    issuePermissions.should.be.defined;
  });

  it('should create dummy `IssuePermissions` instance', () => {
    expect(issuePermissionsNull).toBeTruthy();
    expect(() => issuePermissionsNull.hasPermissionFor()).not.toThrow();
  });


  describe('getRingId', () => {
    it('should not throw without a param and return NULL', () => {
      expect(IssuePermissions.getRingId()).toBeNull();
    });

    it('should return NULL if a param has no `ringId` field', () => {
      expect(IssuePermissions.getRingId({})).toBeNull();
    });

    it('should return entity `ringId` field', () => {
      expect(IssuePermissions.getRingId({ringId: USER_ID})).toEqual(USER_ID);
    });
  });


  describe('getIssueProjectRingId', () => {
    it('should not throw without a param and return NULL', () => {
      expect(IssuePermissions.getIssueProjectRingId()).toBeNull();
    });

    it('should return NULL if a param has no `project` field', () => {
      expect(IssuePermissions.getIssueProjectRingId({})).toBeNull();
    });

    it('should return NULL if a param has no `ringId` field', () => {
      expect(IssuePermissions.getIssueProjectRingId({project: {}})).toBeNull();
    });

    it('should return issue project `ringId` field', () => {
      expect(IssuePermissions.getIssueProjectRingId({project: {ringId: USER_ID}})).toEqual(USER_ID);
    });
  });


  describe('isCurrentUser', () => {
    it('should return FALSE if a parameter is not provided', () => {
      issuePermissions.isCurrentUser().should.be.false;
    });

    it('should return FALSE if `ringId` field is missing', () => {
      issuePermissions.isCurrentUser({}).should.be.false;
    });

    it('should return FALSE if a passed user is not a current user', () => {
      issuePermissions.isCurrentUser({ringId: 'foo'}).should.be.false;
    });

    it('should return TRUE if a passed user is a current user', () => {
      issuePermissions.isCurrentUser({ringId: USER_ID}).should.be.true;
    });
  });


  describe('_canUpdatePublicField', () => {
    it('should return false if issue parameter is not passed', () => {
      expect(issuePermissions._canUpdatePublicField(null)).toEqual(false);
    });
  });


  describe('canUpdateGeneralInfo', () => {
    it('should return false if issue parameter is not passed', () => {
      expect(issuePermissions.canUpdateGeneralInfo(null)).toEqual(false);
    });

    it('should allow to edit general info if user is reporter and has READ_ISSUE', () => {
      permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      issuePermissions.canUpdateGeneralInfo(issueMock).should.be.true;
    });

    it('should not allow to edit issue if user is not reporter but has READ_ISSUE', () => {
      issueMock.reporter = {id: 'foo'};
      permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      issuePermissions.canUpdateGeneralInfo(issueMock).should.be.false;
    });

    it('should not allow to edit issue if user is reporter but not has READ_ISSUE', () => {
      issuePermissions.canUpdateGeneralInfo(issueMock).should.be.false;
    });

    it('should allow to edit if user is not reporter but has UPDATE_ISSUE and READ_ISSUE', () => {
      issueMock.reporter = {id: 'foo'};
      permissionsMock.has.withArgs(READ_ISSUE).returns(true);
      permissionsMock.has.withArgs(UPDATE_ISSUE).returns(true);

      issuePermissions.canUpdateGeneralInfo(issueMock).should.be.true;
    });

    it('should not allow to edit if user is not reporter but has READ_ISSUE and not has UPDATE_ISSUE', () => {
      issueMock.reporter = {id: 'foo'};
      issuePermissions.canUpdateGeneralInfo(issueMock).should.be.false;
    });
  });


  describe('isSameAuthor', () => {
    it('should return FALSE if the passed param has no `user`', () => {
      issuePermissions.isCurrentUser().should.be.false;
    });

    it('should return FALSE if user has different `id` from to the current user `id`', () => {
      issuePermissions.isCurrentUser({id: 'foo'}).should.be.false;
    });

    it('should return TRUE if user has the same `id` as the current user', () => {
      issuePermissions.isCurrentUser({ringId: USER_ID}).should.be.true;
    });
  });


  describe('canUpdateComment', () => {
    it('should allow to update own comment if has update permission', () => {
      permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);

      issuePermissions.canUpdateComment(issueMock, commentMock).should.be.true;
    });

    it('should not allow to update not own comment if don`t have UPDATE-NOT-OWN permission', () => {
      permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(true);
      commentMock.author = {id: 'foo'};

      issuePermissions.canUpdateComment(issueMock, commentMock).should.be.false;
    });

    it('should allow to update not own comment if user has UPDATE-NOT-OWN permission', () => {
      permissionsMock.has.withArgs(CAN_UPDATE_COMMENT).returns(false);
      permissionsMock.has.withArgs(CAN_UPDATE_NOT_OWN_COMMENT).returns(true);
      commentMock.author = {id: 'foo'};

      issuePermissions.canUpdateComment(issueMock, commentMock).should.be.true;
    });
  });


  describe('canUpdateField', () => {
    it('should allow to edit public field to reporter even if only CREATE_ISSUE permission', () => {
      permissionsMock.has.withArgs(CREATE_ISSUE).returns(true);
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.true;
    });

    it('should not allow to edit public field if not reporter and has no UPDATE_ISSUE', () => {
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.false;
    });

    it('should allow to edit public field if has UPDATE_ISSUE', () => {
      permissionsMock.has.withArgs(UPDATE_ISSUE).returns(true);
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.true;
    });

    it('should not allow to update private field if has no PRIVATE_UPDATE_ISSUE', () => {
      fieldMock.projectCustomField.isPublic = false;
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.false;
    });

    it('should allow to update private field if has PRIVATE_UPDATE_ISSUE', () => {
      fieldMock.projectCustomField.isPublic = false;
      permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.true;
    });

    it('should not allow to edit spentTime field', () => {
      permissionsMock.has.withArgs(PRIVATE_UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: fieldMock.projectCustomField.field.id},
      };

      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.false;
    });

    it('should allow to edit spentTime field if old youtrack (no "plugins" field in old YT)', () => {
      permissionsMock.has.withArgs(UPDATE_ISSUE).returns(true);
      delete issueMock.project.plugins;
      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.true;
    });

    it('should allow to edit any other time field', () => {
      permissionsMock.has.withArgs(UPDATE_ISSUE).returns(true);
      const {timeTrackingSettings} = issueMock.project.plugins;
      timeTrackingSettings.enabled = true;
      timeTrackingSettings.timeSpent = {
        field: {id: 'some-another-field'},
      };

      issuePermissions.canUpdateField(issueMock, fieldMock).should.be.true;
    });
  });

  describe('canStar', () => {
    it('should allow to add Star tag', () => {
      expect(issuePermissions.canStar()).toEqual(true);
    });

    it('should not allow to add Star tag', () => {
      issuePermissions = createInstance(permissionsMock, {currentUserMock, ...{guest: true}});

      expect(issuePermissions.canStar()).toEqual(false);
    });

  });

  describe('canVote', () => {
    let issueMock;
    beforeEach(() => {
      issueMock = mocks.createIssueMock();
      issuePermissions = createInstance(permissionsMock, {currentUserMock, ...{guest: true}});
    });

    it('should return FALSE if issue param is not provided', () => {
      expect(issuePermissions.canVote()).toEqual(false);
    });

    it('should return FALSE if user is Guest', () => {
      expect(issuePermissions.canVote(issueMock)).toEqual(false);
    });

    it('should return FALSE if CurrentUser is not set', () => {
      issuePermissions = createInstance(permissionsMock, null);
      expect(issuePermissions.canVote(issueMock)).toEqual(false);
    });

    it('should return FALSE if user is Author', () => {
      issuePermissions = createInstance(permissionsMock, {currentUserMock, ...{guest: true}});

      expect(issuePermissions.canVote({author: currentUserMock})).toEqual(false);
    });

    it('should return TRUE if user is not the Author and is not Guest', () => {
      issuePermissions = createInstance(permissionsMock, {currentUserMock, ...{guest: false}});

      expect(issuePermissions.canVote(issueMock)).toEqual(true);
    });
  });


  describe('articleCanCommentOn', () => {
    it('should allow to update own comment if has update permission', () => {
      mockPermissionsHas(UPDATE_ARTICLE_COMMENT, true);

      expect(
        issuePermissions.articleCanUpdateComment(issueMock, commentMock)
      ).toEqual(true);
    });

    it('should not allow to update not own comment if don`t have UPDATE-NOT-OWN permission', () => {
      mockPermissionsHas(UPDATE_ARTICLE_COMMENT, true);
      commentMock.author = {id: 'foo'};

      expect(
        issuePermissions.articleCanUpdateComment(issueMock, commentMock)
      ).toEqual(false);
    });

    it('should allow to update not own comment if user has UPDATE-NOT-OWN permission', () => {
      mockPermissionsHas(UPDATE_ARTICLE_COMMENT, false);
      mockPermissionsHas(CAN_UPDATE_NOT_OWN_COMMENT, true);
      commentMock.author = {id: 'foo'};

      expect(
        issuePermissions.articleCanUpdateComment(issueMock, commentMock)
      ).toEqual(true);
    });
  });

  describe('Article attachment', () => {
    it('should allow to add an attachment', () => {
      mockPermissionsHas(CREATE_ARTICLE_COMMENT, true);

      expect(issuePermissions.articleCanAddAttachment(issueMock)).toEqual(true);
    });

    it('should not allow to add an attachment', () => {
      mockPermissionsHas(CREATE_ARTICLE_COMMENT, false);

      expect(issuePermissions.articleCanAddAttachment(issueMock)).toEqual(false);
    });

    it('should allow to delete an attachment', () => {
      mockPermissionsHas(UPDATE_ARTICLE, true);

      expect(issuePermissions.articleCanDeleteAttachment(issueMock)).toEqual(true);
    });

    it('should not allow to delete an attachment', () => {
      mockPermissionsHas(UPDATE_ARTICLE, false);

      expect(issuePermissions.articleCanDeleteAttachment(issueMock)).toEqual(false);
    });

  });


  function mockPermissionsHas(permission, value) {
    permissionsMock.has.withArgs(permission).returns(value);
  }

  function createInstance(permissions, user) {
    return new IssuePermissions(permissions, user);
  }
});
