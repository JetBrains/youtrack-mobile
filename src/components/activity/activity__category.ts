export const categoryName = {
  ARTICLE_ATTACHMENTS: 'ARTICLE_ATTACHMENTS',
  ARTICLE_COMMENT: 'ARTICLE_COMMENT',
  ARTICLE_COMMENT_MENTION: 'ARTICLE_COMMENT_MENTION',
  ARTICLE_COMMENT_REACTION: 'ARTICLE_COMMENT_REACTION',
  ARTICLE_CONTENT: 'ARTICLE_CONTENT',
  ARTICLE_CREATED: 'ARTICLE_CREATED',
  ARTICLE_MENTION: 'ARTICLE_MENTION',
  ARTICLE_PROJECT: 'ARTICLE_PROJECT',
  ARTICLE_SUMMARY: 'ARTICLE_SUMMARY',
  ARTICLE_VISIBILITY: 'ARTICLE_VISIBILITY',
  ATTACHMENT_RENAME: 'ATTACHMENT_RENAME',
  ATTACHMENTS: 'ATTACHMENTS',
  COMMENT: 'COMMENT',
  COMMENT_MENTION: 'COMMENT_MENTION',
  COMMENT_REACTION: 'COMMENT_REACTION',
  COMMENT_TEXT: 'COMMENT_TEXT',
  CUSTOM_FIELD: 'CUSTOM_FIELD',
  DESCRIPTION: 'DESCRIPTION',
  ISSUE_CREATED: 'ISSUE_CREATED',
  ISSUE_MENTION: 'ISSUE_MENTION',
  ISSUE_RESOLVED: 'ISSUE_RESOLVED',
  LINKS: 'LINKS',
  PERMITTED_GROUP: 'PERMITTED_GROUP',
  PROJECT: 'PROJECT',
  PULL_REQUEST_CHANGE: 'PULL_REQUEST_CHANGE',
  SPRINT: 'SPRINT',
  STAR: 'STAR',
  SUMMARY: 'SUMMARY',
  TAGS: 'TAGS',
  TOTAL_VOTES: 'TOTAL_VOTES',
  VCS_ITEM: 'VCS_ITEM',
  VISIBILITY: 'VISIBILITY',
  VISIBILITY_ISSUE: 'VISIBILITY_ISSUE',
  VOTERS: 'VOTERS',
  WORK_ITEM: 'WORK_ITEM',
  WORK_ITEM_AUTHOR: 'WORK_ITEM_AUTHOR',
  WORK_ITEM_DATE: 'WORK_ITEM_DATE',
  WORK_ITEM_DESCRIPTION: 'WORK_ITEM_DESCRIPTION',
  WORK_ITEM_DURATION: 'WORK_ITEM_DURATION',
  WORK_ITEM_TYPE: 'WORK_ITEM_TYPE',
  WORK_ITEM_USES_MARKDOWN: 'WORK_ITEM_USES_MARKDOWN',
};
export const activityCategory: Record<string, any> = {
  [categoryName.ARTICLE_ATTACHMENTS]: 'ArticleAttachmentsCategory',
  [categoryName.ARTICLE_COMMENT]: 'ArticleCommentsCategory',
  [categoryName.ARTICLE_COMMENT_MENTION]: 'ArticleCommentMentionCategory',
  [categoryName.ARTICLE_COMMENT_REACTION]: 'ArticleCommentReactionCategory',
  [categoryName.ARTICLE_CONTENT]: 'ArticleDescriptionCategory',
  [categoryName.ARTICLE_CREATED]: 'ArticleCreatedCategory',
  [categoryName.ARTICLE_MENTION]: 'ArticleMentionCategory',
  [categoryName.ARTICLE_PROJECT]: 'ArticleProjectCategory',
  [categoryName.ARTICLE_SUMMARY]: 'ArticleSummaryCategory',
  [categoryName.ARTICLE_VISIBILITY]: 'ArticleVisibilityCategory',
  [categoryName.COMMENT]: 'CommentsCategory',
  [categoryName.COMMENT_MENTION]: 'CommentMentionCategory',
  [categoryName.COMMENT_TEXT]: 'CommentTextCategory',
  [categoryName.COMMENT_REACTION]: 'CommentReactionCategory',
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
  ARTICLE_CREATED: 'ArticleCreatedCategory',
  ATTACHMENTS: 'ArticleAttachmentsCategory',
  COMMENT: 'ArticleCommentsCategory',
  CREATED: 'ArticleCreatedCategory',
  DESCRIPTION: 'ArticleDescriptionCategory',
  PROJECT: 'ArticleProjectCategory',
  SUMMARY: 'ArticleSummaryCategory',
  VISIBILITY: 'ArticleVisibilityCategory',
};

export interface IActivityCategory {
  ActivityCategories: {
    IssueComments: string[];
    IssueHistory: string[];
    IssueVcs: string[];
    TimeTracking: string[];
  };
  CategoryPresentation: {
    IssueComments: string;
    IssueHistory: string;
    IssueVcs: string;
    TimeTracking: string;
  };
  Source: {
    COMMENT: string;
    HISTORY: string;
    WORK_ITEM: string;
    VCS_ITEM: string;
  };
}

export const ActivityCategory: IActivityCategory = [
  ['COMMENT', 'IssueComments', [activityCategory.COMMENT], 'Comments'],
  [
    'HISTORY',
    'IssueHistory',
    [
      activityCategory.ATTACHMENT_RENAME,
      activityCategory.ATTACHMENTS,
      activityCategory.CUSTOM_FIELD,
      activityCategory.DESCRIPTION,
      activityCategory.ISSUE_CREATED,
      activityCategory.ISSUE_RESOLVED,
      activityCategory.LINKS,
      activityCategory.PERMITTED_GROUP,
      activityCategory.PROJECT,
      activityCategory.SPRINT,
      activityCategory.SUMMARY,
      activityCategory.TAGS,
      activityCategory.VISIBILITY,
      activityCategory.VISIBILITY_ISSUE,
    ],
    'Issue history',
  ],
  ['WORK_ITEM', 'TimeTracking', [activityCategory.WORK_ITEM], 'Spent time'],
  [
    'VCS_ITEM',
    'IssueVcs',
    [activityCategory.PULL_REQUEST_CHANGE, activityCategory.VCS_ITEM],
    'VCS changes',
  ],
].reduce(
  function (
    Activity: {
      ActivityCategories: Record<string, any>;
      CategoryPresentation: Record<string, any>;
      Source: Record<string, any>;
    },
    source,
  ) {
    const sourceName = source[0];
    const sourceKey = source[1];
    const activityCategories = source[2];
    const presentation = source[3];
    Activity.Source[sourceName] = sourceKey;
    Activity.CategoryPresentation[sourceKey] = presentation;
    Activity.ActivityCategories[sourceKey] = activityCategories;
    return Activity;
  },
  {
    Source: {},
    ActivityCategories: {},
    CategoryPresentation: {},
  },
);
export const isActivityCategory = function (
  categoryId: string,
): (activity: any) => boolean {
  return function (activity: Record<string, any>) {
    return activity?.category ? activity.category?.id === categoryId : false;
  };
} as any;
export const isActivityCategories = function (
  categoryIds: string[],
): (activity: any) => boolean {
  return function (activity: Record<string, any>) {
    return activity
      ? categoryIds.some(
          (categoryId: string) => categoryId === activity.category.id,
        )
      : false;
  };
};
isActivityCategory.articleCommentMention = isActivityCategory(
  activityCategory.ARTICLE_COMMENT_MENTION,
);
isActivityCategory.articleCreated = isActivityCategory(
  activityCategory.ARTICLE_CREATED,
);
isActivityCategory.articleDescription = isActivityCategory(
  activityArticleCategory.DESCRIPTION,
);
isActivityCategory.articleMention = isActivityCategory(
  activityCategory.ARTICLE_MENTION,
);
isActivityCategory.articleSummary = isActivityCategory(
  activityArticleCategory.SUMMARY,
);
isActivityCategory.attachment = isActivityCategories([
  activityCategory.ATTACHMENTS,
  activityArticleCategory.ATTACHMENTS,
]);
isActivityCategory.attachmentRename = isActivityCategory(
  activityCategory.ATTACHMENT_RENAME,
);
isActivityCategory.comment = isActivityCategories([
  activityCategory.COMMENT,
  activityArticleCategory.COMMENT,
]);
isActivityCategory.commentMention = isActivityCategory(
  activityCategory.COMMENT_MENTION,
);
isActivityCategory.commentText = isActivityCategory(
  activityCategory.COMMENT_TEXT,
);
isActivityCategory.customField = isActivityCategory(
  activityCategory.CUSTOM_FIELD,
);
isActivityCategory.commentReaction = isActivityCategory(
  activityCategory.COMMENT_REACTION
);

isActivityCategory.description = isActivityCategories([
  activityCategory.DESCRIPTION,
  activityArticleCategory.DESCRIPTION,
]);
isActivityCategory.issueCreated = isActivityCategories([
  activityCategory.ISSUE_CREATED,
  activityArticleCategory.CREATED,
]);
isActivityCategory.issueMention = isActivityCategory(
  activityCategory.ISSUE_MENTION,
);
isActivityCategory.issueResolved = isActivityCategory(
  activityCategory.ISSUE_RESOLVED,
);
isActivityCategory.link = isActivityCategory(activityCategory.LINKS);
isActivityCategory.project = isActivityCategories([
  activityCategory.PROJECT,
  activityArticleCategory.PROJECT,
]);
isActivityCategory.pullRequest = isActivityCategory(
  activityCategory.PULL_REQUEST_CHANGE,
);
isActivityCategory.sprint = isActivityCategory(activityCategory.SPRINT);
isActivityCategory.star = isActivityCategory(activityCategory.STAR);
isActivityCategory.summary = isActivityCategories([
  activityCategory.SUMMARY,
  activityArticleCategory.SUMMARY,
]);
isActivityCategory.tag = isActivityCategories([
  activityCategory.TAGS,
  activityCategory.STAR,
]);
isActivityCategory.totalVotes = isActivityCategory(
  activityCategory.TOTAL_VOTES,
);
isActivityCategory.vcs = isActivityCategory(activityCategory.VCS_ITEM);
isActivityCategory.vcsItem = isActivityCategories([
  activityCategory.VCS_ITEM,
  activityCategory.PULL_REQUEST_CHANGE,
]);
isActivityCategory.visibility = isActivityCategories([
  activityCategory.VISIBILITY,
  activityCategory.VISIBILITY_ISSUE,
  activityArticleCategory.VISIBILITY,
]);
isActivityCategory.vote = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.voters = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.work = isActivityCategory(activityCategory.WORK_ITEM);
