/* @flow */
/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */
import type { Permissions } from '../auth/auth__permissions';
import type {AnyIssue} from '../../flow/Issue';
import type {CustomField, IssueProject} from '../../flow/CustomFields';

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_COMMENT';
export const CAN_ADD_ATTACHMENT = 'JetBrains.YouTrack.UPDATE_ATTACHMENT_ISSUE';

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
