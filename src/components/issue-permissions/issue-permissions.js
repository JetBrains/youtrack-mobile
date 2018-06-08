/* @flow */
/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */
import type { Permissions } from '../auth/auth__permissions';
import type {AnyIssue} from '../../flow/Issue';
import type {CustomField, IssueComment, IssueProject} from '../../flow/CustomFields';
import ResourceTypes from '../api/api__resource-types';

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_COMMENT';
export const CAN_ADD_ATTACHMENT = 'JetBrains.YouTrack.CREATE_ATTACHMENT_ISSUE';
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

  static isSecured(entity: ?Object) {
    if (!entity || !entity.visibility) {
      return false;
    }

    const visibility = entity.visibility;
    if (hasLimitedVisibility(visibility)) {
      return true;
    }

    return !!(
      (visibility.permittedUsers && visibility.permittedUsers.length) ||
      (visibility.permittedGroups && visibility.permittedGroups.length)
    );

    function hasLimitedVisibility(visibility: Object) {
      return visibility && visibility.$type && visibility.$type === ResourceTypes.VISIBILITY_LIMITED;
    }
  }

  static createVisibility(visibility: Object = {}) {
    visibility.$type = ResourceTypes.VISIBILITY_LIMITED;
    visibility.permittedUsers = visibility.permittedUsers || [];
    visibility.permittedGroups = visibility.permittedGroups || [];
    return visibility;
  }

    static toggleVisibilityOption(visibility: Object, option: Object): Object {
    visibility = IssuePermissions.createVisibility(visibility);
    for (const it of [
      {type: ResourceTypes.USER, key: 'permittedUsers'},
      {type: ResourceTypes.USER_GROUP, key: 'permittedGroups'}
    ]) {
      if (option.$type === it.type) {
        if (hasOption(visibility[it.key], option.id)) {
          visibility[it.key] = visibility[it.key].filter((user) => user.id !== option.id);
        } else {
          visibility[it.key].push(option);
        }
        break;
      }
    }
    return visibility;

    function hasOption(collection: Array<Object>, optionId: string) {
      return collection.some((user) => user.id === optionId);
    }
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

  _canUpdatePublicField(issue: AnyIssue) {
    const projectId = issue.project.ringId;
    const isReporter = issue.reporter.ringId === this.currentUser.id;
    const canCreateIssue = this.permissions.has(CREATE_ISSUE, projectId);

    return (isReporter && canCreateIssue) || this.permissions.has(PRIVATE_UPDATE_ISSUE, projectId);
  }

  _canUpdatePrivateField(issue: AnyIssue) {
    return this.permissions.has(PRIVATE_UPDATE_ISSUE, issue.project.ringId);
  }

  _isBlockedByTimeTracking(issue: AnyIssue, field: CustomField) {
    if (!issue.project.plugins) {
      return false;
    }

    const {timeTrackingSettings} = issue.project.plugins;
    if (!timeTrackingSettings || !timeTrackingSettings.enabled || !timeTrackingSettings.timeSpent) {
      return false;
    }
    const isSpentTime = timeTrackingSettings.timeSpent.field.id === field.projectCustomField.field.id;

    return isSpentTime; // Spent Time field is always disabled to edit – calculating automatically
  }

  canUpdateField(issue: AnyIssue, field: CustomField) {
    if (this._isBlockedByTimeTracking(issue, field)) {
      return false;
    }
    if (field.projectCustomField.field.isPublic) {
      return this._canUpdatePublicField(issue);
    }
    return this._canUpdatePrivateField(issue);
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

  canRestoreComment(issue: AnyIssue, comment: IssueComment) {
    const isAuthor = comment.author.ringId === this.currentUser.id;
    if (isAuthor) {
      return this.canEditComment(issue, comment) || this.canDeleteComment(issue, comment);
    }
    return this.permissions.has(CAN_DELETE_NOT_OWN_COMMENT, issue.project.ringId);
  }

  canDeleteCommentPermanently(issue: AnyIssue, comment: IssueComment) {
    return this.permissions.has(CAN_DELETE_NOT_OWN_COMMENT, issue.project.ringId);
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
