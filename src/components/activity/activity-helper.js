/* @flow */

import {Activity, isActivityCategory} from './activity__category';
import {createActivitiesModel} from './activity__create-model';
import {groupActivities} from './activity__group-activities';
import {IconComment, IconHistory, IconHourGlass} from '../icon/icon';
import {mergeActivities} from './activity__merge-activities';

import type {ActivityItem, ActivityPositionData, ActivityType, IssueActivity} from '../../flow/Activity';
import type {IssueComment} from '../../flow/CustomFields';

const activityIconMap = {
  [Activity.Source.COMMENT]: IconComment,
  [Activity.Source.HISTORY]: IconHistory,
  [Activity.Source.WORK_ITEM]: IconHourGlass
};

const getActivityAllTypes = (): Array<ActivityType> => {
  return Object.keys(Activity.ActivityCategories).map(
    (key) => Object.assign({id: key, name: Activity.CategoryPresentation[key]})
  );
};

const getActivityCategories = (categoryTypes: Array<ActivityType> = []): Array<string> => {
  return categoryTypes.reduce(
    (list: Array<string>, category: ActivityType) => list.concat(Activity.ActivityCategories[category.id]), []
  );
};

const getIssueActivityIcon = (activityTypeName: string): React$Component<any> => {
  return activityIconMap[activityTypeName];
};

function createActivityFromComment(comment: IssueComment): ActivityItem {
  return {
    $type: 'CommentActivityItem',
    added: [Object.assign({}, comment, {attachments: comment?.attachments || []})],
    author: comment.author,
    authorGroup: null,
    category: {id: 'CommentsCategory', $type: 'ActivityCategory'},
    field: {$type: 'PredefinedFilterField', presentation: 'comments', id: 'comments'},
    id: `${comment.id}.0-0`,
    removed: [],
    target: {$type: 'IssueComment', created: comment.created, id: comment.id, usesMarkdown: comment.usesMarkdown},
    targetMember: null,
    timestamp: comment.created
  };
}

const convertCommentsToActivityPage = (comments: Array<IssueComment> = []): Array<ActivityItem> => {
  return comments.map((comment: IssueComment) => createActivityFromComment(comment));
};

const findActivityInGroupedActivities = (
  groupedActivities: Array<IssueActivity>,
  targetId: string
): ActivityPositionData | null => {
  for (let index = 0; index < groupedActivities.length; index++) {
    const activity: IssueActivity = groupedActivities[index];
    if (activity?.target?.id === targetId) {
      return {
        activity,
        index
      };
    }
  }
  return null;
};


const getGroupedActivity = (activityPage: Array<IssueActivity> = []) => {
  return groupActivities(activityPage, {
    onAddActivityToGroup: (group, activity: IssueActivity) => {
      if (isActivityCategory.issueCreated(activity)) {
        group.hidden = true;
      }
    },
    onCompleteGroup: (group: Object) => {
      group.events = mergeActivities(group.events);
    }
  });
};

const createActivityModel = (activityPage: Array<ActivityItem> | null, naturalCommentsOrder: boolean) => {
  if (!activityPage) {
    return null;
  }
  const groupedActivities = getGroupedActivity(activityPage);
  return createActivitiesModel(
    naturalCommentsOrder ? groupedActivities.reverse() : groupedActivities
  ) || [];
};

export {
  convertCommentsToActivityPage,
  createActivityModel,
  findActivityInGroupedActivities,
  getActivityCategories,
  getActivityAllTypes,
  getIssueActivityIcon,
};
