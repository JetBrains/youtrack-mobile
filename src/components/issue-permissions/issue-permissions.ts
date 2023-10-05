/**
 * https://confluence.jetbrains.com/display/TSYS/Issue+access+rights
 */
import type {AnyIssue} from 'types/Issue';
import type {Article} from 'types/Article';
import type {PermissionsStore} from '../permissions-store/permissions-store';
import type {User} from 'types/User';
import type {
  Attachment,
  CustomField,
  IssueComment,
  IssueProject,
} from 'types/CustomFields';
import type {WorkItem} from 'types/Work';
import {Entity} from 'types/Global';

export const CREATE_ISSUE = 'JetBrains.YouTrack.CREATE_ISSUE';
export const READ_ISSUE = 'JetBrains.YouTrack.READ_ISSUE';
export const UPDATE_ISSUE = 'JetBrains.YouTrack.UPDATE_ISSUE';
export const PRIVATE_UPDATE_ISSUE = 'JetBrains.YouTrack.PRIVATE_UPDATE_ISSUE';
export const CAN_CREATE_COMMENT = 'JetBrains.YouTrack.CREATE_COMMENT';
export const CAN_ADD_ATTACHMENT = 'JetBrains.YouTrack.CREATE_ATTACHMENT_ISSUE';
export const CAN_REMOVE_ATTACHMENT =
  'JetBrains.YouTrack.DELETE_ATTACHMENT_ISSUE';
export const CAN_UPDATE_COMMENT = 'JetBrains.YouTrack.UPDATE_COMMENT';
export const CAN_UPDATE_NOT_OWN_COMMENT =
  'JetBrains.YouTrack.UPDATE_NOT_OWN_COMMENT';
export const CAN_DELETE_COMMENT = 'JetBrains.YouTrack.DELETE_COMMENT';
export const CAN_DELETE_NOT_OWN_COMMENT =
  'JetBrains.YouTrack.DELETE_NOT_OWN_COMMENT';
export const CAN_DELETE_ISSUE =
  'JetBrains.YouTrack.DELETE_ISSUE';
export const CAN_LINK_ISSUE = 'JetBrains.YouTrack.LINK_ISSUE';
export const CAN_UPDATE_WATCH = 'JetBrains.YouTrack.UPDATE_WATCH_FOLDER';
export const CREATE_ARTICLE = 'JetBrains.YouTrack.CREATE_ARTICLE';
export const UPDATE_ARTICLE = 'JetBrains.YouTrack.UPDATE_ARTICLE';
export const DELETE_ARTICLE = 'JetBrains.YouTrack.DELETE_ARTICLE';
export const READ_ARTICLE_COMMENT = 'JetBrains.YouTrack.READ_ARTICLE_COMMENT';
export const CREATE_ARTICLE_COMMENT =
  'JetBrains.YouTrack.CREATE_ARTICLE_COMMENT';
export const UPDATE_ARTICLE_COMMENT =
  'JetBrains.YouTrack.UPDATE_ARTICLE_COMMENT';
export const DELETE_ARTICLE_COMMENT =
  'JetBrains.YouTrack.DELETE_ARTICLE_COMMENT';
export const WORK_ITEM_CREATE = 'JetBrains.YouTrack.CREATE_WORK_ITEM';
export const WORK_ITEM_CREATE_NOT_OWN =
  'JetBrains.YouTrack.CREATE_NOT_OWN_WORK_ITEM';
export const WORK_ITEM_UPDATE = 'JetBrains.YouTrack.UPDATE_WORK_ITEM';
export const WORK_ITEM_UPDATE_NOT_OWN =
  'JetBrains.YouTrack.UPDATE_NOT_OWN_WORK_ITEM';
export default class IssuePermissions {
  permissionsStore: PermissionsStore;
  currentUser: User;

  constructor(permissionsStore: PermissionsStore, currentUser: User) {
    this.permissionsStore = permissionsStore;
    this.currentUser = currentUser;
  }

  static getRingId(entity: Record<string, any>): string | null | undefined {
    if (!entity || !entity.ringId) {
      return null;
    }

    return entity.ringId;
  }

  static getIssueProjectRingId(
    entity: Entity | null | undefined,
  ): string | null | undefined {
    if (!entity || !entity.project) {
      return null;
    }

    return this.getRingId(entity.project);
  }

  hasPermissionFor: (
    entity: Entity | null | undefined,
    permissionName: string,
  ) => boolean = (
    entity: Entity | null | undefined,
    permissionName: string,
  ): boolean => {
    const projectRingId = IssuePermissions.getIssueProjectRingId(entity);
    return (
      !!projectRingId &&
      this.permissionsStore.has(permissionName, projectRingId)
    );
  };
  isCurrentUser: (user: User | null | undefined) => boolean = (
    user: User | null | undefined,
  ): boolean => {
    if (!user || !user.ringId || !this.currentUser || !this.currentUser.id) {
      return false;
    }

    return user.ringId === this.currentUser.id;
  };
  canUpdateGeneralInfo: (issue: AnyIssue | null | undefined) => boolean = (
    issue: AnyIssue | null | undefined,
  ): boolean => {
    if (!issue) {
      return false;
    }

    if (
      this.hasPermissionFor(issue, READ_ISSUE) &&
      this.hasPermissionFor(issue, UPDATE_ISSUE)
    ) {
      return true;
    }

    return (
      this.isCurrentUser(issue?.reporter) &&
      this.hasPermissionFor(issue, CREATE_ISSUE)
    );
  };
  _canUpdatePublicField = (issue: AnyIssue | null | undefined): boolean => {
    if (
      this.isCurrentUser(issue?.reporter) &&
      this.hasPermissionFor(issue, CREATE_ISSUE)
    ) {
      return true;
    }

    return this.hasPermissionFor(issue, UPDATE_ISSUE);
  };
  _canUpdatePrivateField = (issue: AnyIssue): boolean =>
    this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE);
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

    const isSpentTime =
      timeTrackingSettings.timeSpent.field.id ===
      field.projectCustomField.field.id;
    return isSpentTime; // Spent Time field is always disabled to edit – calculating automatically
  };
  canUpdateField: (issue: AnyIssue, field: CustomField) => boolean = (
    issue: AnyIssue,
    field: CustomField,
  ): boolean => {
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
  canCommentOn: (issue: AnyIssue) => boolean = (issue: AnyIssue): boolean =>
    this.hasPermissionFor(issue, CAN_CREATE_COMMENT);
  canDeleteIssue: (issue: AnyIssue) => boolean = (issue: AnyIssue): boolean => this.hasPermissionFor(issue, CAN_DELETE_ISSUE);
  canUpdateComment: (
    entity: AnyIssue | Article,
    comment: IssueComment,
    canUpdateCommentPermissionName?: string,
  ) => boolean = (
    entity: Entity,
    comment: IssueComment,
    canUpdateCommentPermissionName: string = CAN_UPDATE_COMMENT,
  ): boolean => {
    if (!entity) {
      return false;
    }

    if (this.isCurrentUser(comment?.author)) {
      return this.hasPermissionFor(entity, canUpdateCommentPermissionName);
    }

    return this.hasPermissionFor(entity, CAN_UPDATE_NOT_OWN_COMMENT);
  };
  canDeleteNotOwnComment: (issue: Entity) => boolean = (
    issue: Entity,
  ): boolean => this.hasPermissionFor(issue, CAN_DELETE_NOT_OWN_COMMENT);
  canDeleteComment: (
    entity: Entity,
    comment: IssueComment,
    canDeleteCommentPermissionName?: string,
  ) => boolean = (
    entity: Entity,
    comment: IssueComment,
    canDeleteCommentPermissionName: string = CAN_DELETE_COMMENT,
  ): boolean => {
    if (!entity) {
      return false;
    }

    if (this.isCurrentUser(comment?.author)) {
      return this.hasPermissionFor(entity, canDeleteCommentPermissionName);
    }

    return this.canDeleteNotOwnComment(entity);
  };
  canRestoreComment: (issue: AnyIssue, comment: IssueComment) => boolean = (
    issue: AnyIssue,
    comment: IssueComment,
  ): boolean => {
    return (
      this.canDeleteComment(issue, comment) ||
      this.canUpdateComment(issue, comment)
    );
  };
  canDeleteCommentPermanently: (issue: AnyIssue) => boolean = (
    issue: AnyIssue,
  ): boolean => this.canDeleteNotOwnComment(issue);
  canAddAttachmentTo: (issue: AnyIssue) => boolean = (
    issue: AnyIssue,
  ): boolean => this.hasPermissionFor(issue, CAN_ADD_ATTACHMENT);
  canRemoveAttachment: (entity: Entity) => boolean = (
    entity: Entity,
  ): boolean => this.hasPermissionFor(entity, CAN_REMOVE_ATTACHMENT);
  canDeleteCommentAttachment: (
    attachment: Attachment,
    entity: Entity,
  ) => boolean = (
    attachment: Attachment | null | undefined,
    entity: Entity,
  ): boolean => {
    if (attachment?.author && this.isCurrentUser(attachment.author)) {
      return true;
    }

    return this.canRemoveAttachment(entity);
  };
  canCreateIssueToProject: (project: IssueProject) => boolean = (
    project: IssueProject,
  ): boolean => {
    return this.hasPermissionFor(
      {
        project: project,
      } as any,
      CAN_CREATE_COMMENT,
    );
  };
  canVote: (issue: AnyIssue) => boolean = (issue: AnyIssue): boolean =>
    !!issue &&
    !!this.currentUser &&
    !this.isCurrentUser(issue?.reporter) &&
    !this.currentUser.guest;
  canTag: (issue: AnyIssue) => boolean = (issue: AnyIssue): boolean =>
    this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE) ||
    this.hasPermissionFor(issue, CAN_UPDATE_WATCH);
  canStar: () => boolean = (): boolean => !this.currentUser?.guest;
  canRunCommand: (issue: AnyIssue) => boolean = (issue: AnyIssue): boolean => {
    const has = (...args) => this.permissionsStore.has(...args);

    return this.isCurrentUser(issue.reporter) || hasAnyPermission();

    function hasAnyPermission(): boolean {
      const projectRingId = IssuePermissions.getIssueProjectRingId(issue);
      return (
        !!projectRingId &&
        (has(CAN_CREATE_COMMENT, projectRingId) ||
          has(UPDATE_ISSUE, projectRingId) ||
          has(PRIVATE_UPDATE_ISSUE, projectRingId) ||
          has(CAN_LINK_ISSUE, projectRingId) ||
          has(CAN_UPDATE_WATCH, projectRingId))
      );
    }
  };
  canUpdateWork: (entity: AnyIssue, workItem?: WorkItem) => boolean = (
    entity: AnyIssue,
    workItem?: WorkItem,
  ): boolean => {
    if (workItem && workItem.author && this.isCurrentUser(workItem.author)) {
      return this.hasPermissionFor(entity, WORK_ITEM_UPDATE);
    }

    return this.hasPermissionFor(entity, WORK_ITEM_UPDATE_NOT_OWN);
  };
  canCreateWorkNotOwn: (entity: AnyIssue) => boolean = (
    entity: AnyIssue,
  ): boolean => this.hasPermissionFor(entity, WORK_ITEM_CREATE_NOT_OWN);
  canCreateWork: (entity: AnyIssue) => boolean = (entity: AnyIssue): boolean =>
    this.hasPermissionFor(entity, WORK_ITEM_CREATE) ||
    this.canCreateWorkNotOwn(entity);
  canDeleteWork: (entity: AnyIssue, workItem: WorkItem) => boolean = (
    entity: AnyIssue,
    workItem: WorkItem,
  ) => this.canUpdateWork(entity, workItem);
  canLink: (entity: AnyIssue) => boolean = (entity: AnyIssue) => {
    return this.hasPermissionFor(entity, CAN_LINK_ISSUE);
  };
  canReadUser(user: User) {
    return this.isCurrentUser(user) || this.permissionsStore.has('jetbrains.jetpass.user-read');
  }
  canReadUserBasic(user: User) {
    return this.isCurrentUser(user) || this.permissionsStore.has('jetbrains.jetpass.user-read-basic');
  }
  canCreateProject() {
    return this.permissionsStore.has(CREATE_ISSUE);
  }

  /*
   Articles
   */
  canUpdateArticle: (article: Article) => boolean = (
    article: Article,
  ): boolean => {
    if (!article) {
      return false;
    }

    if (this.isCurrentUser(article.reporter)) {
      return true;
    }

    return this.hasPermissionFor(article, UPDATE_ARTICLE);
  };
  articleCanCommentOn: (article: Article) => boolean = (
    article: Article,
  ): boolean => this.hasPermissionFor(article, CREATE_ARTICLE_COMMENT);
  articleCanUpdate: (article: Article) => boolean = (
    article: Article,
  ): boolean => this.hasPermissionFor(article, UPDATE_ARTICLE);
  articleCanUpdateComment: (
    article: Article,
    comment: IssueComment,
  ) => boolean = (article: Article, comment: IssueComment): boolean => {
    return this.canUpdateComment(article, comment, UPDATE_ARTICLE_COMMENT);
  };
  articleCanDeleteComment: (
    article: Article,
    comment: IssueComment,
  ) => boolean = (article: Article, comment: IssueComment): boolean => {
    return this.canDeleteComment(article, comment, DELETE_ARTICLE_COMMENT);
  };
  articleCanCreateArticle: (projectRingId?: string) => any = (
    projectRingId?: string,
  ) => this.permissionsStore.has(CREATE_ARTICLE, projectRingId);
  articleCanDeleteArticle: (projectRingId?: string) => any = (
    projectRingId?: string,
  ) => this.permissionsStore.has(DELETE_ARTICLE, projectRingId);
  articleCanAddAttachment: (article: Article) => boolean = (
    article: Article,
  ): boolean => this.hasPermissionFor(article, CREATE_ARTICLE_COMMENT);
  articleCanDeleteAttachment: (article: Article) => boolean = (
    article: Article,
  ): boolean => this.articleCanUpdate(article);
}
