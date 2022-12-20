import {ActivityCategory, isActivityCategory} from './activity__category';
import {createActivitiesModel} from './activity__create-model';
import {groupActivities} from './activity__group-activities';
import {IconComment, IconHistory, IconHourGlass, IconVcs} from '../icon/icon';
import {mergeActivities} from './activity__merge-activities';
import type {
  ActivityItem,
  ActivityPositionData,
  ActivityType,
  Activity,
} from 'types/Activity';
import type {IssueComment} from 'types/CustomFields';
import {i18n} from '../i18n/i18n';
export interface GroupActivitiesParams {
  onCreateGroup?: (arg0: group) => void;
  onAddActivityToGroup?: (arg0: group, arg1: activity) => void;
  onCompleteGroup?: (arg0: group) => void;
}
const activityIconMap = {
  [ActivityCategory.Source.COMMENT]: IconComment,
  [ActivityCategory.Source.HISTORY]: IconHistory,
  [ActivityCategory.Source.WORK_ITEM]: IconHourGlass,
  [ActivityCategory.Source.VCS_ITEM]: IconVcs,
};

const getActivityAllTypes = (): Array<ActivityType> => {
  return Object.keys(ActivityCategory.ActivityCategories).map(key =>
    Object.assign({
      id: key,
      name: ActivityCategory.CategoryPresentation[key],
    }),
  );
};

const getActivityCategories = (
  categoryTypes: Array<ActivityType> = [],
): Array<string> => {
  return categoryTypes.reduce(
    (list: Array<string>, category: ActivityType) =>
      list.concat(ActivityCategory.ActivityCategories[category.id]),
    [],
  );
};

const getIssueActivityIcon = (
  activityTypeName: string,
): React.Component<any> => {
  return activityIconMap[activityTypeName];
};

const getIssueActivityLabel = (
  activityTypeName: string,
): React.Component<any> => {
  return {
    [ActivityCategory.Source.COMMENT]: i18n('Comments'),
    [ActivityCategory.Source.HISTORY]: i18n('Issue history'),
    [ActivityCategory.Source.WORK_ITEM]: i18n('Spent time'),
    [ActivityCategory.Source.VCS_ITEM]: i18n('VCS changes'),
  }[activityTypeName];
};

function createActivityFromComment(comment: IssueComment): Activity {
  return {
    $type: 'CommentActivityItem',
    added: [
      Object.assign({}, comment, {
        attachments: comment?.attachments || [],
      }),
    ],
    author: comment?.author,
    authorGroup: null,
    category: {
      id: 'CommentsCategory',
      $type: 'ActivityCategory',
    },
    field: {
      $type: 'PredefinedFilterField',
      presentation: 'comments',
      id: 'comments',
    },
    id: `${comment.id}.0-0`,
    removed: [],
    target: {
      $type: 'IssueComment',
      created: comment.created,
      id: comment.id,
      usesMarkdown: comment.usesMarkdown,
    },
    targetMember: null,
    timestamp: comment.created,
  };
}

const convertCommentsToActivityPage = (
  comments: Array<IssueComment> = [],
): Array<Activity> => {
  return comments.map((comment: IssueComment) =>
    createActivityFromComment(comment),
  );
};

const findActivityInGroupedActivities = (
  groupedActivities: Array<Activity>,
  targetId: string,
): ActivityPositionData | null => {
  for (let index = 0; index < groupedActivities.length; index++) {
    const activity: Activity = groupedActivities[index];

    if (activity?.target?.id === targetId) {
      return {
        activity,
        index,
      };
    }
  }

  return null;
};

const createActivityModel = (
  activityPage: Array<Activity> | null,
  naturalCommentsOrder: boolean,
): Array<ActivityItem> | null => {
  if (!activityPage) {
    return null;
  }

  const groupedActivities = groupActivities(activityPage, {
    onAddActivityToGroup: (group, activity: Activity) => {
      if (isActivityCategory.issueCreated(activity)) {
        group.hidden = true;
      }
    },
    onCompleteGroup: (group: Record<string, any>) => {
      group.events = mergeActivities(group.events);
    },
  });
  return (
    createActivitiesModel(
      naturalCommentsOrder ? groupedActivities.reverse() : groupedActivities,
    ) || []
  );
};

export {
  convertCommentsToActivityPage,
  createActivityModel,
  findActivityInGroupedActivities,
  getActivityCategories,
  getActivityAllTypes,
  getIssueActivityIcon,
  getIssueActivityLabel,
};
