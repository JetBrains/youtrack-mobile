/* @flow */

export const ResourceTypes = {
  AGILE: 'jetbrains.youtrack.agile.settings.Agile',

  ARTICLE: 'Article',
  ARTICLE_DRAFT: 'ArticleDraft',

  COMMENT_REACTIONS_FEED_ITEM: 'CommentReactionsFeedItem',

  EVENT_GROUP: 'jetbrains.youtrack.event.gaprest.ActivityItemGroup',

  ISSUE: 'jetbrains.charisma.persistent.Issue',
  ISSUE_COMMENT: 'jetbrains.charisma.persistent.IssueComment',
  ISSUE_FOLDER_SAVED_QUERY: 'jetbrains.charisma.persistent.issueFolders.SavedQuery',
  ISSUE_FOLDER_TAG: 'jetbrains.charisma.persistent.issueFolders.IssueTag',

  PROJECT: 'jetbrains.charisma.persistent.Project',

  USER: 'jetbrains.charisma.persistence.user.User',
  USER_APPEARANCE_PROFILE: 'AppearanceUserProfile',
  USER_GENERAL_PROFILE: 'GeneralUserProfile',
  USER_GROUP: 'jetbrains.charisma.persistent.security.UserGroup',

  VISIBILITY_GROUP: 'jetbrains.charisma.persistent.security.VisibilityGroups',
  VISIBILITY_LIMITED: 'jetbrains.charisma.persistent.visibility.LimitedVisibility',
  VISIBILITY_UNLIMITED: 'jetbrains.charisma.persistent.visibility.UnlimitedVisibility',

  WORK_ITEM: 'jetbrains.youtrack.timetracking.gaprest.IssueWorkItem',
  DRAFT_WORK_ITEM: 'DraftWorkItem',

  DRAFT_ISSUE_COMMENT: 'DraftIssueComment',
  DRAFT_ARTICLE_COMMENT: 'DraftArticleComment'
};

type HasMethodName = 'comment' | 'user' | 'userGroup' | 'project' | 'savedSearch' | 'tag' | 'agile';
type Entity = $Shape<{ $type: string }>;

export const hasType: Object = function (type: string) {
  return function (it: Entity): boolean {
    return it ? it.$type === type || it.$type === getShortEntityType(type) : false;
  };
};

hasType.agile = hasType(ResourceTypes.ISSUE_FOLDER_TAG);
hasType.article = hasType(ResourceTypes.ARTICLE);
hasType.articleDraft = hasType(ResourceTypes.ARTICLE_DRAFT);
hasType.comment = hasType(ResourceTypes.ISSUE_COMMENT);
hasType.commentReaction = hasType(ResourceTypes.COMMENT_REACTIONS_FEED_ITEM);
hasType.issue = hasType(ResourceTypes.ISSUE);
hasType.project = hasType(ResourceTypes.PROJECT);
hasType.savedSearch = hasType(ResourceTypes.ISSUE_FOLDER_SAVED_QUERY);
hasType.tag = hasType(ResourceTypes.ISSUE_FOLDER_TAG);
hasType.user = hasType(ResourceTypes.USER);
hasType.userGroup = hasType(ResourceTypes.USER_GROUP);
hasType.visibilityLimited = hasType(ResourceTypes.VISIBILITY_LIMITED);
hasType.work = hasType(ResourceTypes.WORK_ITEM);


export function filterArrayByType(array: Array<Entity>, methodName: HasMethodName): Array<Entity> {
  return (array || []).filter((it: Entity) => hasType[methodName] && hasType[methodName](it));
}


export const addTypes = function (type: string): Array<string> {
  return [].concat(type).concat(getShortEntityType(type));
};

export function getShortEntityType(type: string): string {
  return type.split('.').pop();
}
