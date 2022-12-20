/* @flow */

import {isActivityCategory} from './activity__category';

import type {Activity} from 'flow/Activity';

type MergedActivity = Activity;

type activityMapItem = {
  [key: string]: Activity;
}

export function mergeActivities(activities: Activity[]): MergedActivity[] {
  if (!activities) {
    return [];
  }

  if (activities.length < 2) {
    return activities;
  }

  return removeEmptyActivities(
    activities.reduce(createActivitiesMerger(), [])
  );
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
        (mergedActivity.removed && mergedActivity.removed.length));
    }

    return (
      (isAddedRemovedValueObject(mergedActivity)) ?
        mergedActivity.added.id !== mergedActivity.removed.id : true
    );
  }
}


function update(mergedActivity: MergedActivity, activity: Activity): MergedActivity {
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
    typeof mergedActivity.added === 'object' && mergedActivity.added !== null &&
    typeof mergedActivity.removed === 'object' && mergedActivity.removed !== null
  );
}


function isMultiple(activity: MergedActivity): boolean {
  return (
    Array.isArray(activity.added) ||
    Array.isArray(activity.removed)
  );
}


function key(activity: Activity): string {
  return `${activity?.target?.id}${activity.targetMember || ''}`;
}


export function merge(A: any[], B: any[]): any[] {
  if (!A || !B) {
    return A || B;
  }
  return removeDuplicates(A.concat(B));
}


function removeDuplicates(A: any[]): any[] {
  const idsMap: { [key: string]: boolean } = {};
  return A.filter(it => {
    return (idsMap[it.id]) ? false : idsMap[it.id] = true;
  });
}


// O(size(A) + 2*size(B))
export function disjoint(A: any, B: any): any {
  if (!A || !B) {
    return [A, B];
  }

  const inB = arrayToMap(B);

  const newA = A.filter(a => {
    return inB[a.id] ? !(delete inB[a.id]) : a;
  });

  const newB = mapToArray(inB);
  return [newA, newB];
}

function arrayToMap(items: any[]): { [string]: any } {
  return items.reduce(function (map, item) {
    map[item.id] = item;
    return map;
  }, {});
}

function mapToArray(map: { [string]: any }): any[] {
  return Object.keys(map).map(function (id) {
    return map[id];
  });
}
