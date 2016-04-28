/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_COMMENT';

export default class IssuePermissions {
  constructor(permissions, currentUser) {
    this.permissions = permissions;
    this.currentUser = currentUser;
  }

  canUpdateGeneralInfo(issue) {
    const projectId = issue.project.ringId;
    const isReporter = issue.reporter.id === this.currentUser.id;
    const canCreateIssue = this.permissions.has(CREATE_ISSUE, projectId);

    if (isReporter && canCreateIssue) {
      return true;
    }

    return this.permissions.hasEvery([READ_ISSUE, UPDATE_ISSUE], projectId);
  }

  _canUpdatePublicField(issue, field) {
    const projectId = issue.project.ringId;
    const isReporter = issue.reporter.id === this.currentUser.id;
    const canCreateIssue = this.permissions.has(CREATE_ISSUE, projectId);

    return (isReporter && canCreateIssue) || this.permissions.has(PRIVATE_UPDATE_ISSUE, projectId);
  }

  _canUpdatePrivateField(issue, field) {
    return this.permissions.has(PRIVATE_UPDATE_ISSUE, issue.project.ringId);
  }

  canUpdateField(issue, field) {
    if (field.projectCustomField.field.isPublic) {
      return this._canUpdatePublicField(issue, field);
    }
    return this._canUpdatePrivateField(issue, field);
  }

  canCommentOn(issue) {
    return this.permissions.has(CAN_CREATE_ISSUE, issue.project.ringId);
  }
}
