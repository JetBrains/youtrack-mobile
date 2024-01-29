import IssuePermissions, {
  CAN_UPDATE_COMMENT,
  CAN_UPDATE_NOT_OWN_COMMENT,
  CREATE_ARTICLE_COMMENT,
  CREATE_ISSUE,
  PRIVATE_UPDATE_ISSUE,
  READ_ISSUE,
  UPDATE_ARTICLE,
  UPDATE_ARTICLE_COMMENT,
  UPDATE_ISSUE,
} from './issue-permissions';

import mocks from 'test/mocks';
import {issuePermissionsNull} from './issue-permissions-helper';

import PermissionsStore from 'components/permissions-store/permissions-store';
import {CustomField, IssueComment} from 'types/CustomFields';
import {Entity} from 'types/Entity';
import {IssueOnList} from 'types/Issue';
import {PermissionCacheItem} from 'types/Permission';
import {ProjectTimeTrackingTimeSpent} from 'types/Project';
import {User} from 'types/User';

describe('IssuePermissions', function () {
  const USER_ID = 'some-user-id';
  const PROJECT_ID = 'some-project-id';
  let currentUserMock: User;
  let issuePermissions: IssuePermissions;
  let permissionsStore: PermissionsStore;
  let issueMock: any;
  let commentMock: IssueComment;
  let fieldMock: CustomField;
  let permissionItemMock: PermissionCacheItem;

  beforeEach(() => {
    permissionItemMock = {
      global: false,
      projects: [{id: 'p1'}, {id: 'p2'}],
      projectIds: ['p1', 'p2'],
      permission: {
        key: 'permissionName',
      },
    };
    permissionsStore = new PermissionsStore([permissionItemMock]);
    issueMock = {
      reporter: {
        ringId: USER_ID,
      } as User,
      project: {
        ringId: PROJECT_ID,
        plugins: {
          timeTrackingSettings: {
            enabled: false,
          },
        },
      },
    } as IssueOnList;
    commentMock = {
      author: {
        ringId: USER_ID,
      },
    } as IssueComment;
    fieldMock = {
      projectCustomField: {
        isPublic: true,
        field: {
          id: 'some-field',
        },
      },
    } as CustomField;
    currentUserMock = {
      id: USER_ID,
      guest: false,
    } as User;
    issuePermissions = createInstance(permissionsStore, currentUserMock);
  });

  it('should init', () => {
    expect(issuePermissions).toBeDefined();
  });

  it('should create dummy `IssuePermissions` instance', () => {
    expect(issuePermissionsNull).toBeTruthy();
    expect(() => issuePermissionsNull.hasPermissionFor(null, '')).not.toThrow();
  });


  describe('getRingId', () => {
    it('should not throw without a param and return NULL', () => {
      expect(IssuePermissions.getRingId({})).toBeNull();
    });

    it('should return NULL if a param has no `ringId` field', () => {
      expect(IssuePermissions.getRingId({})).toBeNull();
    });

    it('should return entity `ringId` field', () => {
      expect(
        IssuePermissions.getRingId({
          ringId: USER_ID,
        })
      ).toEqual(USER_ID);
    });
  });

  describe('getIssueProjectRingId', () => {
    it('should not throw without a param and return NULL', () => {
      expect(IssuePermissions.getIssueProjectRingId(null)).toBeNull();
    });

    it('should return NULL if a param has no `project` field', () => {
      expect(IssuePermissions.getIssueProjectRingId({} as Entity)).toBeNull();
    });

    it('should return NULL if a param has no `ringId` field', () => {
      expect(IssuePermissions.getIssueProjectRingId({project: {}} as Entity)).toBeNull();
    });

    it('should return issue project `ringId` field', () => {
      expect(
        IssuePermissions.getIssueProjectRingId({
          project: {
            ringId: USER_ID,
          },
        } as Entity)
      ).toEqual(USER_ID);
    });
  });


  describe('isCurrentUser', () => {
    it('should return FALSE if a parameter is not provided', () => {
      expect(issuePermissions.isCurrentUser()).toEqual(false);
    });

    it('should return FALSE if `ringId` field is missing', () => {
      expect(issuePermissions.isCurrentUser({} as User)).toEqual(false);
    });

    it('should return FALSE if a passed user is not a current user', () => {
      expect(issuePermissions.isCurrentUser({
        ringId: 'foo',
      } as User)).toEqual(false);
    });

    it('should return TRUE if a passed user is a current user', () => {
      expect(issuePermissions.isCurrentUser({
        ringId: USER_ID,
      } as User)).toEqual(true);
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

    it('should allow to edit general info if user is reporter and has CREATE_ISSUE', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === CREATE_ISSUE
      );

      expect(issuePermissions.canUpdateGeneralInfo(issueMock)).toEqual(true);
    });

    it('should not allow to edit issue if user is not reporter but has READ_ISSUE', () => {
      setNoReporter();
      setNoReporter();
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === CREATE_ISSUE
      );

      expect(issuePermissions.canUpdateGeneralInfo(issueMock)).toEqual(false);
    });

    it('should not allow to edit issue if user is reporter but not has READ_ISSUE', () => {
      expect(issuePermissions.canUpdateGeneralInfo(issueMock)).toEqual(false);
    });

    it('should allow to edit if user is not reporter but has UPDATE_ISSUE and READ_ISSUE', () => {
      setNoReporter();
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === READ_ISSUE || permissionId === UPDATE_ISSUE
      );

      expect(issuePermissions.canUpdateGeneralInfo(issueMock)).toEqual(true);
    });

    it('should not allow to edit if user is not reporter but has READ_ISSUE and not has UPDATE_ISSUE', () => {
      setNoReporter();
      expect(issuePermissions.canUpdateGeneralInfo(issueMock)).toEqual(false);
    });
  });


  describe('isSameAuthor', () => {
    it('should return FALSE if the passed param has no `user`', () => {
      expect(issuePermissions.isCurrentUser()).toEqual(false);
    });

    it('should return TRUE if user has the same `id` as the current user', () => {
      expect(issuePermissions.isCurrentUser(issueMock.reporter)).toEqual(true);
    });

    it('should return FALSE if user has different `id` from to the current user `id`', () => {
      setNoReporter();

      expect(issuePermissions.isCurrentUser(issueMock.reporter)).toEqual(false);
    });
  });


  describe('canUpdateComment', () => {
    it('should allow to update own comment if has update permission', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === CAN_UPDATE_COMMENT
      );

      expect(issuePermissions.canUpdateComment(issueMock, commentMock)).toEqual(true);
    });

    it('should not allow to update not own comment if don`t have UPDATE-NOT-OWN permission', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === CAN_UPDATE_COMMENT
      );
      commentMock.author.ringId = 'foo';

      expect(issuePermissions.canUpdateComment(issueMock, commentMock)).toEqual(false);
    });

    it('should allow to update not own comment if user has UPDATE-NOT-OWN permission', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation((permissionId: string) => {
        return permissionId === CAN_UPDATE_NOT_OWN_COMMENT || false;
      });

      commentMock.author.ringId = 'foo';

      expect(issuePermissions.canUpdateComment(issueMock, commentMock)).toEqual(true);
    });
  });


  describe('canUpdateField', () => {
    it('should allow to edit public field to reporter even if only CREATE_ISSUE permission', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === CREATE_ISSUE
      );

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(true);
    });

    it('should not allow to edit public field if not reporter and has no UPDATE_ISSUE', () => {
      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(false);
    });

    it('should allow to edit public field if has UPDATE_ISSUE', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === UPDATE_ISSUE
      );

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(true);
    });
    it('should not allow to update private field if has no PRIVATE_UPDATE_ISSUE', () => {
      fieldMock.projectCustomField.isPublic = false;

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(false);
    });

    it('should allow to update private field if has PRIVATE_UPDATE_ISSUE', () => {
      fieldMock.projectCustomField.isPublic = false;
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === PRIVATE_UPDATE_ISSUE
      );

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(true);
    });

    it('should not allow to edit spentTime field', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === PRIVATE_UPDATE_ISSUE
      );

      const timeTrackingSettings = issueMock.project.plugins!.timeTrackingSettings;
      timeTrackingSettings!.enabled = true;
      timeTrackingSettings!.timeSpent = {
        field: {
          id: fieldMock.projectCustomField.field.id,
        },
      } as ProjectTimeTrackingTimeSpent;

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(false);
    });

    it('should allow to edit spentTime field if old youtrack (no "plugins" field in old YT)', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === UPDATE_ISSUE
      );
      delete issueMock.project.plugins;

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(true);
    });

    it('should allow to edit any other time field', () => {
      jest.spyOn(permissionsStore, 'has').mockImplementation(
        (permissionId: string) => permissionId === UPDATE_ISSUE
      );

      const timeTrackingSettings = issueMock.project!.plugins!.timeTrackingSettings;
      timeTrackingSettings!.enabled = true;
      timeTrackingSettings!.timeSpent = {
        field: {
          id: 'some-another-field',
        },
      } as ProjectTimeTrackingTimeSpent;

      expect(issuePermissions.canUpdateField(issueMock, fieldMock)).toEqual(true);
    });
  });


  describe('canStar', () => {
    it('should allow to add Star tag', () => {
      expect(issuePermissions.canStar()).toEqual(true);
    });

    it('should not allow to add Star tag', () => {
      issuePermissions = createInstance(permissionsStore, {
        ...currentUserMock,
        guest: true,
      });
      expect(issuePermissions.canStar()).toEqual(false);
    });
  });


  describe('canVote', () => {
    beforeEach(() => {
      issueMock = mocks.createIssueMock();
      issuePermissions = createInstance(permissionsStore, {
        ...currentUserMock,
        guest: true,
      });
    });

    it('should return FALSE if issue param is not provided', () => {
      expect(issuePermissions.canVote(null as any)).toEqual(false);
    });

    it('should return FALSE if user is Guest', () => {
      expect(issuePermissions.canVote(issueMock)).toEqual(false);
    });

    it('should return FALSE if CurrentUser is not set', () => {
      issuePermissions = createInstance(permissionsStore, null as any);
      expect(issuePermissions.canVote(issueMock)).toEqual(false);
    });

    it('should return FALSE if user is Author', () => {
      issuePermissions = createInstance(permissionsStore, {
        ...currentUserMock,
        guest: true,
      });

      expect(
        issuePermissions.canVote({reporter: currentUserMock} as IssueOnList)
      ).toEqual(false);
    });

    it('should return TRUE if user is not the Author and is not Guest', () => {
      issuePermissions = createInstance(permissionsStore, {
        ...currentUserMock,
        guest: false,
      });
      expect(issuePermissions.canVote(issueMock)).toEqual(true);
    });
  });


  describe('articleCanCommentOn', () => {
    it('should allow to update own comment if has update permission', () => {
      permissionStoreHasReturnsTrueForPermission(UPDATE_ARTICLE_COMMENT);

      expect(issuePermissions.articleCanUpdateComment(issueMock, commentMock)).toEqual(true);
    });

    it('should not allow to update not own comment if don`t have UPDATE-NOT-OWN permission', () => {
      permissionStoreHasReturnsTrueForPermission(UPDATE_ARTICLE_COMMENT);
      commentMock.author.ringId = 'foo';

      expect(issuePermissions.articleCanUpdateComment(issueMock, commentMock)).toEqual(false);
    });

    it('should allow to update not own comment if user has UPDATE-NOT-OWN permission', () => {
      permissionStoreHasReturnsTrueForPermission(CAN_UPDATE_NOT_OWN_COMMENT);
      commentMock.author.ringId = 'foo';
      expect(issuePermissions.articleCanUpdateComment(issueMock, commentMock)).toEqual(true);
    });
  });


  describe('Article attachment', () => {
    it('should allow to add an attachment', () => {
      permissionStoreHasReturnsTrueForPermission(CREATE_ARTICLE_COMMENT);
      expect(issuePermissions.articleCanAddAttachment(issueMock)).toEqual(true);
    });

    it('should not allow to add an attachment', () => {
      expect(issuePermissions.articleCanAddAttachment(issueMock)).toEqual(false);
    });

    it('should allow to delete an attachment', () => {
      permissionStoreHasReturnsTrueForPermission(UPDATE_ARTICLE);
      expect(issuePermissions.articleCanDeleteAttachment(issueMock)).toEqual(true);
    });

    it('should not allow to delete an attachment', () => {
      expect(issuePermissions.articleCanDeleteAttachment(issueMock)).toEqual(false);
    });
  });

  function permissionStoreHasReturnsTrueForPermission(permission: string) {
    jest.spyOn(permissionsStore, 'has').mockImplementation(
      (permissionId: string) => permissionId === permission
    );
  }

  function createInstance(permissions: PermissionsStore, user: User) {
    return new IssuePermissions(permissions, user);
  }

  function setNoReporter() {
    issueMock.reporter = {
      id: 'foo',
    } as User;
  }

});
