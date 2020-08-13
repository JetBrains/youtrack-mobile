/* @flow */
/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */
import type {AnyIssue} from '../../flow/Issue';
import type {PermissionsStore} from '../permissions-store/permissions-store';
import type {User} from '../../flow/User';
import type {
  CustomField,
  IssueComment,
  IssueProject
} from '../../flow/CustomFields';

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_COMMENT = 'JetBrains.YouTrack.CREATE_COMMENT';
export const CAN_ADD_ATTACHMENT = 'JetBrains.YouTrack.CREATE_ATTACHMENT_ISSUE';
export const CAN_REMOVE_ATTACHMENT = 'JetBrains.YouTrack.DELETE_ATTACHMENT_ISSUE';
export const CAN_UPDATE_COMMENT = 'JetBrains.YouTrack.UPDATE_COMMENT';
export const CAN_UPDATE_NOT_OWN_COMMENT = 'JetBrains.YouTrack.UPDATE_NOT_OWN_COMMENT';
export const CAN_DELETE_COMMENT = 'JetBrains.YouTrack.DELETE_COMMENT';
export const CAN_DELETE_NOT_OWN_COMMENT = 'JetBrains.YouTrack.DELETE_NOT_OWN_COMMENT';
export const CAN_LINK_ISSUE = 'JetBrains.YouTrack.LINK_ISSUE';
export const CAN_UPDATE_WATCH = 'JetBrains.YouTrack.UPDATE_WATCH_FOLDER';

export default class IssuePermissions {
  permissionsStore: PermissionsStore;
  currentUser: User;

  constructor(permissionsStore: PermissionsStore, currentUser: User) {
    this.permissionsStore = permissionsStore;
    this.currentUser = currentUser;
  }

  static getRingId(entity: Object): ?string {
    if (!entity || !entity.ringId) {
      return null;
    }
    return entity.ringId;
  }

  static getIssueProjectRingId(entity: AnyIssue): ?string {
    if (!entity || !entity.project) {
      return null;
    }
    return this.getRingId(entity.project);
  }

  hasPermissionFor = (issue: AnyIssue, permissionName: string): boolean => {
    const projectRingId = IssuePermissions.getIssueProjectRingId(issue);
    return !!projectRingId && this.permissionsStore.has(permissionName, projectRingId);
  };

  isCurrentUser = (user: User): boolean => {
    if (!user || !user.ringId || !this.currentUser || !this.currentUser.id) {
      return false;
    }

    return user.ringId === this.currentUser.id;
  };

  canUpdateGeneralInfo = (issue: ?AnyIssue): boolean => {
    if (!issue) {
      return false;
    }

    if (this.hasPermissionFor(issue, READ_ISSUE) && this.hasPermissionFor(issue, UPDATE_ISSUE)) {
      return true;
    }

    return this.isCurrentUser(issue?.reporter) && this.hasPermissionFor(issue, CREATE_ISSUE);
  };

  _canUpdatePublicField = (issue: ?AnyIssue): boolean => {
    if (this.isCurrentUser(issue?.reporter) && this.hasPermissionFor(issue, CREATE_ISSUE)) {
      return true;
    }
    return this.hasPermissionFor(issue, UPDATE_ISSUE);
  };

  _canUpdatePrivateField = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE);

  _isBlockedByTimeTracking = (issue: AnyIssue, field: CustomField): boolean => {
    if (!issue.project || !issue.project.plugins) {
      return false;
    }

    const {timeTrackingSettings} = issue.project.plugins;
    if (
      !timeTrackingSettings ||
      !timeTrackingSettings.enabled ||
      !timeTrackingSettings.timeSpent
    ) {
      return false;
    }
    const isSpentTime = timeTrackingSettings.timeSpent.field.id === field.projectCustomField.field.id;

    return isSpentTime; // Spent Time field is always disabled to edit – calculating automatically
  };

  canUpdateField = (issue: AnyIssue, field: CustomField): boolean => {
    if (!issue) {
      return false;
    }
    if (this._isBlockedByTimeTracking(issue, field)) {
      return false;
    }
    if (field.projectCustomField && field.projectCustomField.isPublic) {
      return this._canUpdatePublicField(issue);
    }
    return this._canUpdatePrivateField(issue);
  };

  canCommentOn = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, CAN_CREATE_COMMENT);

  canUpdateComment = (issue: AnyIssue, comment: IssueComment): boolean => {
    if (!issue) {
      return false;
    }
    if (this.isCurrentUser(comment.author)) {
      return this.hasPermissionFor(issue, CAN_UPDATE_COMMENT);
    }
    return this.hasPermissionFor(issue, CAN_UPDATE_NOT_OWN_COMMENT);
  };

  canDeleteNotOwnComment = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, CAN_DELETE_NOT_OWN_COMMENT);

  canDeleteComment = (issue: AnyIssue, comment: IssueComment): boolean => {
    if (!issue) {
      return false;
    }
    if (this.isCurrentUser(comment.author)) {
      return this.hasPermissionFor(issue, CAN_DELETE_COMMENT);
    }
    return this.canDeleteNotOwnComment(issue);
  };

  canRestoreComment = (issue: AnyIssue, comment: IssueComment): boolean => {
    return this.canDeleteComment(issue, comment) || this.canUpdateComment(issue, comment);
  };

  canDeleteCommentPermanently = (issue: AnyIssue): boolean => this.canDeleteNotOwnComment(issue);

  canAddAttachmentTo = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, CAN_ADD_ATTACHMENT);

  canRemoveAttachment = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, CAN_REMOVE_ATTACHMENT);

  canCreateIssueToProject = (project: IssueProject): boolean => {
    return this.hasPermissionFor({project: project}, CAN_CREATE_COMMENT);
  };

  canVote = (issue: AnyIssue): boolean => !!issue && !this.isCurrentUser(issue?.reporter) && !this.currentUser?.guest;

  canTag = (issue: AnyIssue):boolean => (
    this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE) ||
    this.hasPermissionFor(issue, CAN_UPDATE_WATCH)
  )

  canStar = ():boolean => !this.currentUser.guest

  canRunCommand = (issue: AnyIssue): boolean => {
    const has = (...args) => this.permissionsStore.has(...args);

    return this.isCurrentUser(issue.reporter) || hasAnyPermission();

    function hasAnyPermission(): boolean {
      const projectRingId = IssuePermissions.getIssueProjectRingId(issue);

      return !!projectRingId && (
        has(CAN_CREATE_COMMENT, projectRingId) ||
        has(UPDATE_ISSUE, projectRingId) ||
        has(PRIVATE_UPDATE_ISSUE, projectRingId) ||
        has(CAN_LINK_ISSUE, projectRingId) ||
        has(CAN_UPDATE_WATCH, projectRingId)
      );
    }
  };
}
