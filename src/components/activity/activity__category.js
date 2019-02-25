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

  VOTERS: 'VotersCategory',
  TOTAL_VOTES: 'TotalVotesCategory',

  VISIBILITY: 'PermittedGroupCategory',
};


export const Activity = [
  ['COMMENT', 'IssueComments', [
    activityCategory.COMMENT
  ], 'Show comments'],
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
  ], 'History'],
  ['WORK_ITEM', 'TimeTracking', [
    activityCategory.WORK_ITEM
  ], 'Work']
].reduce(function(Activity, source) {
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
  CategoryPresentation: {}
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
isActivityCategory.voters = isActivityCategory(activityCategory.VOTERS);
isActivityCategory.totalVotes = isActivityCategory(activityCategory.TOTAL_VOTES);
isActivityCategory.commentText = isActivityCategory(activityCategory.COMMENT_TEXT);
isActivityCategory.customField = isActivityCategory(activityCategory.CUSTOM_FIELD);
isActivityCategory.date = isActivityCategory(activityCategory.ISSUE_RESOLVED);
isActivityCategory.link = isActivityCategory(activityCategory.LINKS);
isActivityCategory.tag = isActivityCategory(activityCategory.TAGS);
isActivityCategory.summary = isActivityCategory(activityCategory.SUMMARY);
isActivityCategory.description = isActivityCategory(activityCategory.DESCRIPTION);
isActivityCategory.sprint = isActivityCategory(activityCategory.SPRINT);
isActivityCategory.project = isActivityCategory(activityCategory.PROJECT);
isActivityCategory.visibility = isActivityCategory(activityCategory.VISIBILITY);


