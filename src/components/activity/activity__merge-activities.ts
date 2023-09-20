import {arrayToMap, mapToArray, removeDuplicatesFromArray} from 'util/util';
import {getTypes} from 'views/inbox-threads/inbox-threads-helper';
import {isActivityCategory} from './activity__category';

import type {Activity} from 'types/Activity';

type MergedActivity = Activity;
type activityMapItem = Record<string, Activity>;


export function mergeActivities(activities: Activity[]): MergedActivity[] {
  if (!activities) {
    return [];
  }

  if (activities.length < 2) {
    return activities;
  }

  return removeEmptyActivities(activities.reduce(createActivitiesMerger(), []));
}

function createMergedActivity(activity: Activity) {
  return Object.create(activity);
}

function createActivitiesMerger() {
  const activitiesMap: activityMapItem = {};
  return function (activities: any, activity: Activity) {
    const k = key(activity);

    if (activitiesMap[k]) {
      update(activitiesMap[k], activity);
    } else {
      activitiesMap[k] = createMergedActivity(activity);
      activities.push(activitiesMap[k]);
    }

    return activities;
  };
}

function removeEmptyActivities(activities: MergedActivity[]): MergedActivity[] {
  return activities.filter(hasChanges);

  function hasChanges(mergedActivity) {
    if (isActivityCategory.issueCreated(mergedActivity)) {
      return true;
    }

    if (isActivityCategory.articleCreated(mergedActivity)) {
      return true;
    }

    if (mergedActivity.added === mergedActivity.removed) {
      return false;
    }

    if (isMultiple(mergedActivity)) {
      return (
        (mergedActivity.added && mergedActivity.added.length) ||
        (mergedActivity.removed && mergedActivity.removed.length)
      );
    }

    return isAddedRemovedValueObject(mergedActivity)
      ? mergedActivity.added.id !== mergedActivity.removed.id
      : true;
  }
}

function update(
  mergedActivity: MergedActivity,
  activity: Activity,
): MergedActivity {
  if (activity.pseudo) {
    mergedActivity.removed = activity.removed;
    mergedActivity.added = activity.added;
  } else if (isMultiple(mergedActivity)) {
    const addedRemoved = disjoint(mergedActivity.added, activity.removed);
    const removedAdded = disjoint(mergedActivity.removed, activity.added);
    mergedActivity.added = merge(addedRemoved[0], removedAdded[1]);
    mergedActivity.removed = merge(addedRemoved[1], removedAdded[0]);
  }

  if (activity.timestamp > mergedActivity.timestamp) {
    mergedActivity.added = activity.added;
    mergedActivity.timestamp = activity.timestamp;
    mergedActivity.id = activity.id;
  }

  return mergedActivity;
}

function isAddedRemovedValueObject(mergedActivity: MergedActivity): boolean {
  return (
    !isMultiple(mergedActivity) &&
    typeof mergedActivity.added === 'object' &&
    mergedActivity.added !== null &&
    typeof mergedActivity.removed === 'object' &&
    mergedActivity.removed !== null
  );
}

function isMultiple(activity: MergedActivity): boolean {
  return Array.isArray(activity.added) || Array.isArray(activity.removed);
}

function key(activity: Activity): string {
  return `${activity?.target?.id}${activity.targetMember || ''}`;
}

export function merge(A: any[], B: any[]): any[] {
  if (!A || !B) {
    return A || B;
  }

  return removeDuplicatesFromArray(A.concat(B));
}

// O(size(A) + 2*size(B))
export function disjoint(A: any, B: any): any {
  if (!A || !B) {
    return [A, B];
  }

  const inB = arrayToMap(B);
  const newA = A.filter(a => {
    return inB[a.id] ? !delete inB[a.id] : a;
  });
  const newB = mapToArray(inB);
  return [newA, newB];
}

export function bubbleProjectActivity(activities: Activity[]) {
  let projectActivity;
  let i;
  for (i = 0; i < activities.length; i++) {
    if (getTypes(activities[i]).project) {
      projectActivity = activities[i];
      break;
    }
  }

  if (!projectActivity) {
    return activities;
  }

  const sortedEvents = [activities[i]];
  return sortedEvents.concat(activities.slice(0, i)).concat(activities.slice(i + 1, activities.length));
}
