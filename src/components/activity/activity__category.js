/* @flow */

export const activityCategory = {
  COMMENT: 'CommentsCategory',
  COMMENT_TEXT: 'CommentTextCategory',

  ATTACHMENTS: 'AttachmentsCategory',
  ATTACHMENT_RENAME: 'AttachmentRenameCategory',

  CUSTOM_FIELD: 'CustomFieldCategory',

  DESCRIPTION: 'DescriptionCategory',

  LINKS: 'LinksCategory',

  ISSUE_CREATED: 'IssueCreatedCategory',
  ISSUE_RESOLVED: 'IssueResolvedCategory',

  PROJECT: 'ProjectCategory',

  PERMITTED_GROUP: 'PermittedGroupCategory',

  SPRINT: 'SprintCategory',

  SUMMARY: 'SummaryCategory',

  TAGS: 'TagsCategory',

  WORK_ITEM: 'WorkItemCategory',
  WORK_ITEM_TYPE: 'WorkItemTypeCategory',
  WORK_ITEM_DESCRIPTION: 'WorkItemDescriptionCategory',
  WORK_ITEM_USES_MARKDOWN: 'WorkItemUsesMarkdownCategory',
  WORK_ITEM_DURATION: 'WorkItemDurationCategory',
  WORK_ITEM_DATE: 'WorkItemDateCategory',
  WORK_ITEM_AUTHOR: 'WorkItemAuthorCategory',

  VCS_CHANGE: 'VcsChangeCategory',
  VCS_CHANGE_STATE: 'VcsChangeStateCategory',

  VOTERS: 'VotersCategory',
  TOTAL_VOTES: 'TotalVotesCategory',
};


export const Activity = [
  ['COMMENT', 'IssueComments', [
    activityCategory.COMMENT
  ]],
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
    activityCategory.TAGS
  ]],
  ['WORK_ITEM', 'TimeTracking', [
    activityCategory.WORK_ITEM
  ]],
  ['VCS', 'IssueVcs', [
    activityCategory.VCS_CHANGE
  ]]
].reduce(function(Activity, source) {
  const sourceName = source[0];
  const sourceKey = source[1];
  const activityCategories = source[2];

  Activity.Source[sourceName] = sourceKey;
  Activity.ActivityCategories[sourceKey] = activityCategories;

  activityCategories.forEach(function(categoryId) {
    Activity.sourceKeyByCategoryId[categoryId] = sourceKey;
  });
  return Activity;
}, {
  Source: {},
  sourceKeyByCategoryId: {},
  ActivityCategories: {}
});


export const isActivityCategory = function(categoryId: string) {
  return function(activity: Object) {
    return activity ? activity.category.id === categoryId : false;
  };
};

isActivityCategory.comment = isActivityCategory(activityCategory.COMMENT);
isActivityCategory.attachment = isActivityCategory(activityCategory.ATTACHMENTS);
isActivityCategory.issueCreated = isActivityCategory(activityCategory.ISSUE_CREATED);
isActivityCategory.work = isActivityCategory(activityCategory.WORK_ITEM);
isActivityCategory.vcs = isActivityCategory(activityCategory.VCS_CHANGE);
isActivityCategory.voters = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.totalVotes = isActivityCategory(activityCategory.TOTAL_VOTES);
isActivityCategory.commentText = isActivityCategory(activityCategory.COMMENT_TEXT);


