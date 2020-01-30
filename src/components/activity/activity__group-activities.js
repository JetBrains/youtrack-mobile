/* @flow */

import {isActivityCategory} from './activity__category';
import type {IssueActivity} from '../../flow/Activity';

const IDLE_TIME = 60 * 1000;

export const groupActivities = (activities: Array<IssueActivity> = [], params: Object = {}) => {
  return activities.reduce((groups: Array<Object>, activity: IssueActivity, activityIndex) => {
    let group = last(groups);

    if (
      !group ||
      authorDiffers(group, activity) ||
      exceedsIdleTime(group.timestamp, activity.timestamp) ||
      isTerminated(activity) && containsTerminatedActivity(group)
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
  }, []);


  function isLastActivity(activities, activityIndex) {
    return activities.length === (activityIndex + 1);
  }


  function onComplete(group) {
    return group && params.onCompleteGroup && params.onCompleteGroup(group);
  }


  function onCreate(group) {
    return (params.onCreateGroup && params.onCreateGroup(group));
  }


  function onAddActivity(group, activity) {
    return (params.onAddActivityToGroup && params.onAddActivityToGroup(group, activity));
  }
};


function exceedsIdleTime(prev: number, next: number) {
  return Math.abs(next - prev) > IDLE_TIME;
}


function authorDiffers(item1, item2) {
  return item1.author && item1.author.id !== item2.author.id;
}


function createActivityGroup(params: Object) {
  return {
    events: [],
    author: params.author || null,
    authorGroup: params.authorGroup,
    timestamp: params.timestamp || null
  };
}


function containsTerminatedActivity(group: Object) {
  return group.$$hasTerminated;
}


function isTerminated(activity: Object) {
  return isActivityCategory.comment(activity) || isActivityCategory.issueCreated(activity);
}


function addActivity(group: Object, activity: Object) {
  if (!group.authorGroup && activity.authorGroup) {
    group.authorGroup = activity.authorGroup;
  }

  if (isTerminated(activity)) {
    group.$$hasTerminated = true;
  }

  group.timestamp = activity.timestamp;
  group.events.push(activity);
  return group;
}


function last(items) {
  return items[items.length - 1];
}

