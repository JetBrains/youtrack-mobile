/* @flow */

export const categoryName = {
  ARTICLE_MENTION: 'ARTICLE_MENTION',
  ARTICLE_COMMENT_MENTION: 'ARTICLE_COMMENT_MENTION',
  COMMENT: 'COMMENT',
  COMMENT_MENTION: 'COMMENT_MENTION',
  COMMENT_TEXT: 'COMMENT_TEXT',
  ATTACHMENTS: 'ATTACHMENTS',
  ATTACHMENT_RENAME: 'ATTACHMENT_RENAME',
  CUSTOM_FIELD: 'CUSTOM_FIELD',
  DESCRIPTION: 'DESCRIPTION',
  LINKS: 'LINKS',
  ISSUE_CREATED: 'ISSUE_CREATED',
  ISSUE_MENTION: 'ISSUE_MENTION',
  ISSUE_RESOLVED: 'ISSUE_RESOLVED',
  PROJECT: 'PROJECT',
  PERMITTED_GROUP: 'PERMITTED_GROUP',
  PULL_REQUEST_CHANGE: 'PULL_REQUEST_CHANGE',
  SPRINT: 'SPRINT',
  SUMMARY: 'SUMMARY',
  TAGS: 'TAGS',
  WORK_ITEM: 'WORK_ITEM',
  WORK_ITEM_TYPE: 'WORK_ITEM_TYPE',
  WORK_ITEM_DESCRIPTION: 'WORK_ITEM_DESCRIPTION',
  WORK_ITEM_USES_MARKDOWN: 'WORK_ITEM_USES_MARKDOWN',
  WORK_ITEM_DURATION: 'WORK_ITEM_DURATION',
  WORK_ITEM_DATE: 'WORK_ITEM_DATE',
  WORK_ITEM_AUTHOR: 'WORK_ITEM_AUTHOR',
  VOTERS: 'VOTERS',
  VCS_ITEM: 'VCS_ITEM',
  TOTAL_VOTES: 'TOTAL_VOTES',
  VISIBILITY: 'VISIBILITY',
  VISIBILITY_ISSUE: 'VISIBILITY_ISSUE',
  STAR: 'STAR',
};

export const activityCategory: Object = {
  [categoryName.ARTICLE_MENTION]: 'ArticleMentionCategory',
  [categoryName.ARTICLE_COMMENT_MENTION]: 'ArticleCommentMentionCategory',
  [categoryName.COMMENT]: 'CommentsCategory',
  [categoryName.COMMENT_MENTION]: 'CommentMentionCategory',
  [categoryName.COMMENT_TEXT]: 'CommentTextCategory',
  [categoryName.ATTACHMENTS]: 'AttachmentsCategory',
  [categoryName.ATTACHMENT_RENAME]: 'AttachmentRenameCategory',
  [categoryName.CUSTOM_FIELD]: 'CustomFieldCategory',
  [categoryName.DESCRIPTION]: 'DescriptionCategory',
  [categoryName.LINKS]: 'LinksCategory',
  [categoryName.ISSUE_CREATED]: 'IssueCreatedCategory',
  [categoryName.ISSUE_MENTION]: 'IssueMentionCategory',
  [categoryName.ISSUE_RESOLVED]: 'IssueResolvedCategory',
  [categoryName.PROJECT]: 'ProjectCategory',
  [categoryName.PERMITTED_GROUP]: 'PermittedGroupCategory',
  [categoryName.SPRINT]: 'SprintCategory',
  [categoryName.SUMMARY]: 'SummaryCategory',
  [categoryName.TAGS]: 'TagsCategory',
  [categoryName.WORK_ITEM]: 'WorkItemCategory',
  [categoryName.WORK_ITEM_TYPE]: 'WorkItemTypeCategory',
  [categoryName.WORK_ITEM_DESCRIPTION]: 'WorkItemDescriptionCategory',
  [categoryName.WORK_ITEM_USES_MARKDOWN]: 'WorkItemUsesMarkdownCategory',
  [categoryName.WORK_ITEM_DURATION]: 'WorkItemDurationCategory',
  [categoryName.WORK_ITEM_DATE]: 'WorkItemDateCategory',
  [categoryName.WORK_ITEM_AUTHOR]: 'WorkItemAuthorCategory',
  [categoryName.VOTERS]: 'VotersCategory',
  [categoryName.VCS_ITEM]: 'VcsChangeCategory',
  [categoryName.PULL_REQUEST_CHANGE]: 'PullRequestChangeCategory',
  [categoryName.TOTAL_VOTES]: 'TotalVotesCategory',
  [categoryName.VISIBILITY]: 'PermittedGroupCategory',
  [categoryName.VISIBILITY_ISSUE]: 'IssueVisibilityCategory',
  [categoryName.STAR]: 'StarCategory',
};

export const activityArticleCategory = {
  ATTACHMENTS: 'ArticleAttachmentsCategory',
  COMMENT: 'ArticleCommentsCategory',
  CREATED: 'ArticleCreatedCategory',
  DESCRIPTION: 'ArticleDescriptionCategory',
  PROJECT: 'ArticleProjectCategory',
  SUMMARY: 'ArticleSummaryCategory',
  VISIBILITY: 'ArticleVisibilityCategory',

  ARTICLE_CREATED: 'ArticleCreatedCategory',
};


export const ActivityCategory: {
  ActivityCategories: {
    IssueComments: Array<string>,
    IssueHistory: Array<string>,
    TimeTracking: Array<string>,
    IssueVcs: Array<string>,
  },
  CategoryPresentation: {
    IssueComments: string,
    IssueHistory: string,
    TimeTracking: string,
    IssueVcs: string,
  },
  Source: { COMMENT: string, HISTORY: string, WORK_ITEM: string, VCS_ITEM: string },
} = [
  ['COMMENT', 'IssueComments', [
    activityCategory.COMMENT,
  ], 'Comments'],
  ['HISTORY', 'IssueHistory', [
    activityCategory.ATTACHMENTS,
    activityCategory.ATTACHMENT_RENAME,
    activityCategory.CUSTOM_FIELD,
    activityCategory.DESCRIPTION,
    activityCategory.ISSUE_CREATED,
    activityCategory.ISSUE_RESOLVED,
    activityCategory.LINKS,
    activityCategory.PROJECT,
    activityCategory.PERMITTED_GROUP,
    activityCategory.SPRINT,
    activityCategory.SUMMARY,
    activityCategory.TAGS,
  ], 'Issue history'],
  ['WORK_ITEM', 'TimeTracking', [
    activityCategory.WORK_ITEM,
  ], 'Spent time'],
  ['VCS_ITEM', 'IssueVcs', [
    activityCategory.VCS_ITEM,
    activityCategory.PULL_REQUEST_CHANGE,
  ], 'VCS changes'],
].reduce(function (Activity: {
  Source: Object,
  CategoryPresentation: Object,
  ActivityCategories: Object,
}, source) {
  const sourceName = source[0];
  const sourceKey = source[1];
  const activityCategories = source[2];
  const presentation = source[3];

  Activity.Source[sourceName] = sourceKey;
  Activity.CategoryPresentation[sourceKey] = presentation;
  Activity.ActivityCategories[sourceKey] = activityCategories;

  return Activity;
}, {
  Source: {},
  ActivityCategories: {},
  CategoryPresentation: {},
});


export const isActivityCategory = (function (categoryId: string): ((activity: any) => boolean) {
  return function (activity: Object) {
    return activity ? activity.category.id === categoryId : false;
  };
}: any);

export const isActivityCategories = function (categoryIds: Array<string>): ((activity: any) => boolean) {
  return function (activity: Object) {
    return activity ? categoryIds.some((categoryId: string) => categoryId === activity.category.id) : false;
  };
};

isActivityCategory.comment = isActivityCategories([activityCategory.COMMENT, activityArticleCategory.COMMENT]);
isActivityCategory.commentMention = isActivityCategory(activityCategory.COMMENT_MENTION);
isActivityCategory.attachment = isActivityCategories([activityCategory.ATTACHMENTS, activityArticleCategory.ATTACHMENTS]);
isActivityCategory.issueCreated = isActivityCategories([activityCategory.ISSUE_CREATED, activityArticleCategory.CREATED]);
isActivityCategory.articleCreated = isActivityCategory(activityCategory.ARTICLE_CREATED);
isActivityCategory.work = isActivityCategory(activityCategory.WORK_ITEM);
isActivityCategory.voters = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.vote = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.vcsItem = isActivityCategories([activityCategory.VCS_ITEM, activityCategory.PULL_REQUEST_CHANGE]);
isActivityCategory.pullRequest = isActivityCategory(activityCategory.PULL_REQUEST_CHANGE);
isActivityCategory.vcs = isActivityCategory(activityCategory.VCS_ITEM);
isActivityCategory.totalVotes = isActivityCategory(activityCategory.TOTAL_VOTES);
isActivityCategory.commentText = isActivityCategory(activityCategory.COMMENT_TEXT);
isActivityCategory.customField = isActivityCategory(activityCategory.CUSTOM_FIELD);
isActivityCategory.issueResolved = isActivityCategory(activityCategory.ISSUE_RESOLVED);
isActivityCategory.link = isActivityCategory(activityCategory.LINKS);
isActivityCategory.tag = isActivityCategories([activityCategory.TAGS, activityCategory.STAR]);
isActivityCategory.summary = isActivityCategories([activityCategory.SUMMARY, activityArticleCategory.SUMMARY]);
isActivityCategory.description = isActivityCategories([activityCategory.DESCRIPTION, activityArticleCategory.DESCRIPTION]);
isActivityCategory.sprint = isActivityCategory(activityCategory.SPRINT);
isActivityCategory.star = isActivityCategory(activityCategory.STAR);
isActivityCategory.project = isActivityCategories([activityCategory.PROJECT, activityArticleCategory.PROJECT]);
isActivityCategory.visibility = isActivityCategories([activityCategory.VISIBILITY, activityCategory.VISIBILITY_ISSUE, activityArticleCategory.VISIBILITY]);
isActivityCategory.articleCommentMention = isActivityCategory(activityCategory.ARTICLE_COMMENT_MENTION);
isActivityCategory.articleMention = isActivityCategory(activityCategory.ARTICLE_MENTION);
isActivityCategory.issueMention = isActivityCategory(activityCategory.ISSUE_MENTION);
