import {isHelpdeskProject} from 'components/helpdesk';

import type {Article, ArticleProject} from 'types/Article';
import type {Attachment, CustomField, IssueComment} from 'types/CustomFields';
import type {PermissionsStore} from '../permissions-store/permissions-store';
import type {User, UserHelpdeskProfile} from 'types/User';
import type {WorkItem} from 'types/Work';
import {Entity} from 'types/Entity';
import {Project} from 'types/Project';
import {UserCurrent} from 'types/User';

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
  currentUser: UserCurrent;

  constructor(permissionsStore: PermissionsStore, currentUser: User) {
    this.permissionsStore = permissionsStore;
    this.currentUser = currentUser;
  }

  static getRingId(entity: Project | Partial<Project>): string | null {
    if (!entity || !entity.ringId) {
      return null;
    }

    return entity.ringId;
  }

  static getIssueProjectRingId(entity: Entity | null): string | null {
    if (!entity || !entity.project) {
      return null;
    }

    return this.getRingId(entity.project);
  }

  hasPermissionFor = (entity: Entity | null, permissionName: string): boolean => {
    const projectRingId = IssuePermissions.getIssueProjectRingId(entity);
    return !!projectRingId && this.permissionsStore.has(permissionName, projectRingId);
  };

  isCurrentUser = (user?: User | null): boolean => {
    if (!user || !user.ringId || !this.currentUser || !this.currentUser.id) {
      return false;
    }

    return user.ringId === this.currentUser.id;
  };

  canUpdateGeneralInfo = (issue: Entity | null): boolean => {
    if (!issue) {
      return false;
    }

    if (this.hasPermissionFor(issue, READ_ISSUE) && this.hasPermissionFor(issue, UPDATE_ISSUE)) {
      return true;
    }

    return this.isCurrentUser(issue?.reporter) && this.hasPermissionFor(issue, CREATE_ISSUE);
  };

  _canUpdatePublicField = (issue: Entity): boolean => {
    if (this.isCurrentUser(issue?.reporter) && this.hasPermissionFor(issue, CREATE_ISSUE)) {
      return true;
    }

    return this.hasPermissionFor(issue, UPDATE_ISSUE);
  };

  _canUpdatePrivateField = (issue: Entity): boolean => this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE);

  _isBlockedByTimeTracking = (issue: Entity, field: CustomField): boolean => {
    if (!issue.project || !issue.project.plugins) {
      return false;
    }

    const {timeTrackingSettings} = issue.project.plugins;

    if (!timeTrackingSettings || !timeTrackingSettings.enabled || !timeTrackingSettings.timeSpent) {
      return false;
    }

    const isSpentTime = timeTrackingSettings.timeSpent.field.id === field.projectCustomField.field.id;
    return isSpentTime; // Spent Time field is always disabled to edit – calculating automatically
  };

  canUpdateField = (issue: Entity, field: CustomField): boolean => {
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

  getUserProfileHelpdeskSettings = (): UserHelpdeskProfile | null => {
    return this.currentUser?.ytCurrentUser?.profiles?.helpdesk || null;
  };

  isInProject = (project: Project | ArticleProject, projects: Array<{id: string}>): boolean => {
    return projects.some((p: {id: string}) => p.id === project.id);
  };

  isAgentInProject = (project: Project | ArticleProject): boolean => {
    const settings = this.getUserProfileHelpdeskSettings();
    return settings ? this.isInProject(project, settings.agentInProjects) : false;
  };

  isReporterInProject = (project: Project | ArticleProject): boolean => {
    const settings = this.getUserProfileHelpdeskSettings();
    return settings ? this.isInProject(project, settings.reporterInProjects) : false;
  };

  canCommentPublicly = (entity: Entity): boolean => {
    if (entity.project && isHelpdeskProject(entity)) {
      return this.isReporterInProject(entity.project) || this.isAgentInProject(entity.project);
    }
    return true;
  };

  canUpdateCommentVisibility = (entity: Entity): boolean => {
    if (entity.project && isHelpdeskProject(entity)) {
      return this.isAgentInProject(entity.project);
    }
    return true;
  };

  canCommentOn = (issue: Entity): boolean => this.hasPermissionFor(issue, CAN_CREATE_COMMENT);

  canDeleteIssue = (issue: Entity): boolean => this.hasPermissionFor(issue, CAN_DELETE_ISSUE);

  canUpdateComment = (
    entity: Entity,
    comment: IssueComment,
    canUpdateCommentPermissionName: string = CAN_UPDATE_COMMENT
  ): boolean => {
    if (!entity) {
      return false;
    }

    const helpdeskProject = isHelpdeskProject(entity);
    if (this.isCurrentUser(comment?.author)) {
      return this.hasPermissionFor(entity, canUpdateCommentPermissionName) && !helpdeskProject;
    }

    return this.hasPermissionFor(entity, CAN_UPDATE_NOT_OWN_COMMENT) && !helpdeskProject;
  };

  canDeleteNotOwnComment = (issue: Entity): boolean => this.hasPermissionFor(issue, CAN_DELETE_NOT_OWN_COMMENT);

  canDeleteComment = (
    entity: Entity,
    comment: IssueComment,
    canDeleteCommentPermissionName: string = CAN_DELETE_COMMENT
  ): boolean => {
    if (!entity) {
      return false;
    }

    if (this.isCurrentUser(comment?.author)) {
      return this.hasPermissionFor(entity, canDeleteCommentPermissionName);
    }

    return this.canDeleteNotOwnComment(entity);
  };

  canRestoreComment = (issue: Entity, comment: IssueComment): boolean =>
    this.canDeleteComment(issue, comment) || this.canUpdateComment(issue, comment);

  canDeleteCommentPermanently = (issue: Entity): boolean => this.canDeleteNotOwnComment(issue);

  canAddAttachmentTo = (entity: Entity, allowedInHelpdesk: boolean = false): boolean =>
    this.hasPermissionFor(entity, CAN_ADD_ATTACHMENT) && (!isHelpdeskProject(entity) || allowedInHelpdesk);

  canRemoveAttachment = (entity: Entity): boolean => this.hasPermissionFor(entity, CAN_REMOVE_ATTACHMENT);

  canDeleteCommentAttachment = (attachment: Attachment | null | undefined, entity: Entity): boolean => {
    if (attachment?.author && this.isCurrentUser(attachment.author)) {
      return true;
    }

    return this.canRemoveAttachment(entity);
  };

  canCreateIssueToProject = (project: Project): boolean =>
    this.hasPermissionFor(
      {
        project: project,
      } as any,
      CAN_CREATE_COMMENT
    );

  canVote = (issue: Entity): boolean =>
    !!issue && !!this.currentUser && !this.isCurrentUser(issue?.reporter) && !this.currentUser.guest;

  canTag = (issue: Entity): boolean =>
    this.hasPermissionFor(issue, PRIVATE_UPDATE_ISSUE) || this.hasPermissionFor(issue, CAN_UPDATE_WATCH);

  canStar = (): boolean => !this.currentUser?.guest;

  canRunCommand = (issue: Entity): boolean => {
    const has = this.permissionsStore.has;

    return this.isCurrentUser(issue.reporter) || hasSomePermissionToUpdate();

    function hasSomePermissionToUpdate(): boolean {
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
  canUpdateWork = (entity: Entity, workItem?: WorkItem): boolean => {
    if (workItem && workItem.author && this.isCurrentUser(workItem.author)) {
      return this.hasPermissionFor(entity, WORK_ITEM_UPDATE);
    }

    return this.hasPermissionFor(entity, WORK_ITEM_UPDATE_NOT_OWN);
  };

  canCreateWorkNotOwn = (entity: Entity): boolean => this.hasPermissionFor(entity, WORK_ITEM_CREATE_NOT_OWN);

  canCreateWork = (entity: Entity): boolean =>
    this.hasPermissionFor(entity, WORK_ITEM_CREATE) || this.canCreateWorkNotOwn(entity);

  canDeleteWork = (entity: Entity, workItem: WorkItem) => this.canUpdateWork(entity, workItem);

  canLink = (entity: Entity) => {
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
  canUpdateArticle: (article: Article) => boolean = (article: Article): boolean => {
    if (!article) {
      return false;
    }

    if (this.isCurrentUser(article.reporter)) {
      return true;
    }

    return this.hasPermissionFor(article, UPDATE_ARTICLE);
  };

  articleCanCommentOn = (article: Article): boolean => this.hasPermissionFor(article, CREATE_ARTICLE_COMMENT);

  articleCanUpdate = (article: Article): boolean => this.hasPermissionFor(article, UPDATE_ARTICLE);

  articleCanUpdateComment = (article: Article, comment: IssueComment): boolean =>
    this.canUpdateComment(article, comment, UPDATE_ARTICLE_COMMENT);

  articleCanDeleteComment = (article: Article, comment: IssueComment): boolean =>
    this.canDeleteComment(article, comment, DELETE_ARTICLE_COMMENT);

  articleCanCreateArticle = (projectRingId?: string) => this.permissionsStore.has(CREATE_ARTICLE, projectRingId);

  articleCanDeleteArticle = (projectRingId?: string) => this.permissionsStore.has(DELETE_ARTICLE, projectRingId);

  articleCanAddAttachment = (article: Article): boolean => this.hasPermissionFor(article, CREATE_ARTICLE_COMMENT);

  articleCanDeleteAttachment = (article: Article): boolean => this.articleCanUpdate(article);
}
