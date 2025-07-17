import {isActivityCategory} from './activity__category';

import type {Activity, ActivityAuthorGroup} from 'types/Activity';
import type {UserBase} from 'types/User';

const IDLE_TIME = 60 * 1000;

interface ActivityGroup {
  author: UserBase;
  authorGroup?: ActivityAuthorGroup | null;
  timestamp: number;
  events: Activity[];
  $$hasTerminated?: boolean;
}

export const groupActivities = (
  activities: Activity[],
  params: {
    onAddActivityToGroup?: (group: ActivityGroup, activity: Activity) => void;
    onCompleteGroup?: (group: ActivityGroup) => void;
    onCreateGroup?: (group: ActivityGroup) => void;
  },
) => {
  return (activities || []).reduce(
    (groups: ActivityGroup[], activity: Activity, activityIndex) => {
      let group = last(groups);

      if (
        !group ||
        authorDiffers(group, activity) ||
        exceedsIdleTime(group.timestamp, activity.timestamp) ||
        (isTerminated(activity) && containsTerminatedActivity(group))
      ) {
        onComplete(group);
        group = createActivityGroup(activity);
        groups.push(group);
        onCreate(group);
      }

      onAddActivity(group, activity);
      addActivity(group, activity);

      if (isLastActivity(activities, activityIndex)) {
        onComplete(group);
      }

      return groups;
    },
    [],
  );

  function isLastActivity(a: Activity[], activityIndex: number) {
    return a.length === activityIndex + 1;
  }

  function onComplete(group: ActivityGroup) {
    return group && params.onCompleteGroup && params.onCompleteGroup(group);
  }

  function onCreate(group: ActivityGroup) {
    return params.onCreateGroup && params.onCreateGroup(group);
  }

  function onAddActivity(group: ActivityGroup, activity: Activity) {
    return (
      params.onAddActivityToGroup &&
      params.onAddActivityToGroup(group, activity)
    );
  }
};

function exceedsIdleTime(prev: number, next: number) {
  return Math.abs(next - prev) > IDLE_TIME;
}

function authorDiffers(item1: ActivityGroup, item2: Activity) {
  return item1?.author && item2?.author && item1.author.id !== item2.author.id;
}

function createActivityGroup(activity: Activity): ActivityGroup {
  return {
    events: [],
    author: activity.author,
    authorGroup: activity.authorGroup,
    timestamp: activity.timestamp,
  };
}

function containsTerminatedActivity(group: ActivityGroup) {
  return group.$$hasTerminated;
}

function isTerminated(activity: Activity) {
  return (
    isActivityCategory.comment(activity) ||
    isActivityCategory.issueCreated(activity)
  );
}

function addActivity(
  group: ActivityGroup,
  activity: Activity,
) {
  if (!group?.authorGroup && activity?.authorGroup) {
    group.authorGroup = activity.authorGroup;
  }

  if (isTerminated(activity)) {
    group.$$hasTerminated = true;
  }

  group.timestamp = activity.timestamp;
  group.events.push(activity);
  return group;
}

function last(groups: ActivityGroup[]) {
  return groups[groups.length - 1];
}
