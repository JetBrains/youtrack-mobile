export const ResourceTypes = {
  AGILE: 'jetbrains.youtrack.agile.settings.Agile',
  ARTICLE: 'Article',
  ARTICLE_COMMENT: 'ArticleComment',
  ARTICLE_DRAFT: 'ArticleDraft',
  BITBUCKET: 'BitBucketServer',
  BITBUCKET_MAPPING: 'BitBucketChangesProcessor',
  COMMENT_REACTIONS_FEED_ITEM: 'CommentReactionsFeedItem',
  CUSTOM_FIELD_TEXT: 'TextCustomFieldActivityItem',
  DRAFT_ARTICLE_COMMENT: 'DraftArticleComment',
  DRAFT_ISSUE_COMMENT: 'DraftIssueComment',
  DRAFT_WORK_ITEM: 'DraftWorkItem',
  EVENT_GROUP: 'jetbrains.youtrack.event.gaprest.ActivityItemGroup',
  FIELD_BASED_COLOR_CODING: 'FieldBasedColorCoding',
  GITEA: 'GiteaServer',
  GITHUB_MAPPING: 'GitHubChangesProcessor',
  GITLAB_MAPPING: 'GitLabChangesProcessor',
  GOGS: 'GogsServer',
  GOGS_MAPPING: 'GogsChangesProcessor',
  ISSUE: 'jetbrains.charisma.persistent.Issue',
  ISSUE_COMMENT: 'jetbrains.charisma.persistent.IssueComment',
  ISSUE_FOLDER_SAVED_QUERY:
    'jetbrains.charisma.persistent.issueFolders.SavedQuery',
  ISSUE_FOLDER_TAG: 'jetbrains.charisma.persistent.issueFolders.IssueTag',
  JENKINS_CHANGES_PROCESSOR: 'JenkinsChangesProcessor',
  JENKINS_SERVER: 'JenkinsServer',
  PROJECT: 'jetbrains.charisma.persistent.Project',
  PROJECT_BASED_COLOR_CODING: 'ProjectBasedColorCoding',
  SPACE_MAPPING: 'SpaceChangesProcessor',
  SPACE_SERVER: 'SpaceServer',
  TAG: 'jetbrains.charisma.persistent.issueFolders.Tag',
  TEAMCITY_CHANGES_PROCESSOR: 'TeamcityChangesProcessor',
  UPSOURCE_PROCESSOR: 'UpsourceChangesProcessor',
  USER: 'jetbrains.charisma.persistence.user.User',
  USER_APPEARANCE_PROFILE: 'AppearanceUserProfile',
  USER_GROUP: 'jetbrains.charisma.persistent.security.UserGroup',
  VCS_CHANGE: 'VcsChange',
  VCS_ITEM: 'jetbrains.youtrack.timetracking.gaprest.VcsChangeActivityItem',
  VISIBILITY_GROUP: 'jetbrains.charisma.persistent.security.VisibilityGroups',
  VISIBILITY_LIMITED:
    'jetbrains.charisma.persistent.visibility.LimitedVisibility',
  VISIBILITY_UNLIMITED:
    'jetbrains.charisma.persistent.visibility.UnlimitedVisibility',
  WORK_ITEM: 'jetbrains.youtrack.timetracking.gaprest.IssueWorkItem',
};
type HasMethodName =
  | 'comment'
  | 'user'
  | 'userGroup'
  | 'project'
  | 'savedSearch'
  | 'tag'
  | 'agile';
type Entity = Partial<{
  $type: string;
}>;
export const hasType = function (type: string) {
  return function (it: Entity): boolean {
    return it
      ? it.$type === type || it.$type === getShortEntityType(type)
      : false;
  };
};
hasType.agile = hasType(ResourceTypes.AGILE);
hasType.article = hasType(ResourceTypes.ARTICLE);
hasType.articleComment = hasType(ResourceTypes.ARTICLE_COMMENT);
hasType.articleDraft = hasType(ResourceTypes.ARTICLE_DRAFT);
hasType.comment = hasType(ResourceTypes.ISSUE_COMMENT);
hasType.commentDraft =
  hasType(ResourceTypes.DRAFT_ISSUE_COMMENT) ||
  hasType(ResourceTypes.DRAFT_ARTICLE_COMMENT);
hasType.commentReaction = hasType(ResourceTypes.COMMENT_REACTIONS_FEED_ITEM);
hasType.customFieldText = hasType(ResourceTypes.CUSTOM_FIELD_TEXT);
hasType.issue = hasType(ResourceTypes.ISSUE);
hasType.project = hasType(ResourceTypes.PROJECT);
hasType.savedSearch = hasType(ResourceTypes.ISSUE_FOLDER_SAVED_QUERY);
hasType.tag = hasType(ResourceTypes.ISSUE_FOLDER_TAG) || hasType(ResourceTypes.TAG);
hasType.user = hasType(ResourceTypes.USER);
hasType.userGroup = hasType(ResourceTypes.USER_GROUP);
hasType.visibilityLimited = hasType(ResourceTypes.VISIBILITY_LIMITED);
hasType.work = hasType(ResourceTypes.WORK_ITEM);
export function filterArrayByType(
  array: Entity[],
  methodName: HasMethodName,
): Entity[] {
  return (array || []).filter(
    (it: Entity) => hasType[methodName] && hasType[methodName](it),
  );
}
export const addTypes = function (type: string): string[] {
  return [].concat(type).concat(getShortEntityType(type));
};
export function getShortEntityType(type: string): string {
  return type.split('.').pop();
}
