/* @flow */
/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */
import type { Permissions } from '../auth/auth__permissions';
import type {AnyIssue} from '../../flow/Issue';
import type {CustomField, IssueComment, IssueProject} from '../../flow/CustomFields';

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_COMMENT';
export const CAN_ADD_ATTACHMENT = 'JetBrains.YouTrack.UPDATE_ATTACHMENT_ISSUE';
export const CAN_UPDATE_COMMENT = 'JetBrains.YouTrack.UPDATE_COMMENT';
export const CAN_UPDATE_NOT_OWN_COMMENT = 'JetBrains.YouTrack.UPDATE_NOT_OWN_COMMENT';
export const CAN_DELETE_COMMENT = 'JetBrains.YouTrack.DELETE_COMMENT';
export const CAN_DELETE_NOT_OWN_COMMENT = 'JetBrains.YouTrack.DELETE_NOT_OWN_COMMENT';

export default class IssuePermissions {
  permissions: Permissions;
  currentUser: Object;

  constructor(permissions: Object, currentUser: Object) {
    this.permissions = permissions;
    this.currentUser = currentUser;
  }

  canUpdateGeneralInfo(issue: AnyIssue) {
    const projectId = issue.project.ringId;
    const isReporter = issue.reporter.ringId === this.currentUser.id;
    const canCreateIssue = this.permissions.has(CREATE_ISSUE, projectId);

    if (isReporter && canCreateIssue) {
      return true;
    }

    return this.permissions.hasEvery([READ_ISSUE, UPDATE_ISSUE], projectId);
  }

  _canUpdatePublicField(issue: AnyIssue, field: CustomField) {
    const projectId = issue.project.ringId;
    const isReporter = issue.reporter.ringId === this.currentUser.id;
    const canCreateIssue = this.permissions.has(CREATE_ISSUE, projectId);

    return (isReporter && canCreateIssue) || this.permissions.has(PRIVATE_UPDATE_ISSUE, projectId);
  }

  _canUpdatePrivateField(issue: AnyIssue, field: CustomField) {
    return this.permissions.has(PRIVATE_UPDATE_ISSUE, issue.project.ringId);
  }

  canUpdateField(issue: AnyIssue, field: CustomField) {
    if (field.projectCustomField.field.isPublic) {
      return this._canUpdatePublicField(issue, field);
    }
    return this._canUpdatePrivateField(issue, field);
  }

  canCommentOn(issue: AnyIssue) {
    return this.permissions.has(CAN_CREATE_ISSUE, issue.project.ringId);
  }

  canEditComment(issue: AnyIssue, comment: IssueComment) {
    const projectId = issue.project.ringId;
    const isAuthor = comment.author.ringId === this.currentUser.id;
    if (isAuthor) {
      return this.permissions.has(CAN_UPDATE_COMMENT, projectId);
    }
    return this.permissions.has(CAN_UPDATE_NOT_OWN_COMMENT, projectId);
  }

  canDeleteComment(issue: AnyIssue, comment: IssueComment) {
    const projectId = issue.project.ringId;
    const isAuthor = comment.author.ringId === this.currentUser.id;
    if (isAuthor) {
      return this.permissions.has(CAN_DELETE_COMMENT, projectId);
    }
    return this.permissions.has(CAN_DELETE_NOT_OWN_COMMENT, projectId);
  }

  canAddAttachmentTo(issue: AnyIssue) {
    return this.permissions.has(CAN_ADD_ATTACHMENT, issue.project.ringId);
  }

  canCreateIssueToProject(project: IssueProject) {
    return this.permissions.has(CAN_CREATE_ISSUE, project.ringId);
  }

  canVote(issue: AnyIssue) {
    return issue.reporter.ringId !== this.currentUser.id;
  }
}
