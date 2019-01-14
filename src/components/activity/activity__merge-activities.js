/* @flow */

export const mergeActivities = (activities: Array<Object>) => {
  if (!activities || activities.length < 2) {
    return activities;
  }

  return removeEmptyActivities(
    activities.reduce(createActivitiesMerger(), [])
  );


  function createActivitiesMerger() {
    const activitiesMap = {};

    return (activities, activity) => {
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


  function removeEmptyActivities(activities: Array<Object>): Array<Object> {
    return activities.filter(hasChanges);

    function hasChanges(mergedActivity) {
      if (mergedActivity.added === mergedActivity.removed) {
        return false;
      }

      if (isMultiple(mergedActivity)) {
        return (
          (mergedActivity.added && mergedActivity.added.length) ||
          (mergedActivity.removed && mergedActivity.removed.length));
      }

      return (
        (typeof mergedActivity.added === 'object' && typeof mergedActivity.removed === 'object') ?
          mergedActivity.added.id !== mergedActivity.removed.id :
          true
      );
    }
  }


  function update(mergedActivity, activity) {
    if (isMultiple(mergedActivity)) {
      const addedRemoved = disjoint(mergedActivity.added, activity.removed);
      const removedAdded = disjoint(mergedActivity.removed, activity.added);
      mergedActivity.added = merge(addedRemoved[0], removedAdded[1]);
      mergedActivity.removed = merge(addedRemoved[1], removedAdded[0]);
    } else {
      mergedActivity.added = activity.added;
    }

    mergedActivity.timestamp = activity.timestamp;
    mergedActivity.id = activity.id;

    return mergedActivity;
  }


  function isMultiple(activity) {
    return Array.isArray(activity.added) || Array.isArray(activity.removed);
  }


  function createMergedActivity(activity) {
    return Object.create(activity);
  }


  function key(activity: Object) {
    return `${activity.target.id}${activity.targetMember || ''}`;
  }


  function merge(A, B) {
    if (!A || !B) {
      return A || B;
    }
    return removeDuplicates(A.concat(B));
  }


  function removeDuplicates(A) {
    const idsMap = {};
    return A.filter((it) => (idsMap[it.id]) ? false : idsMap[it.id] = true);
  }


  function disjoint(A, B) {
    if (!A || !B) {
      return [A, B];
    }

    const inB = arrayToMap(B);

    A = A.filter(a => inB[a.id] ? !(delete inB[a.id]) : a);

    B = mapToArray(inB);
    return [A, B];
  }

  function arrayToMap(items) {
    return items.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});
  }

  function mapToArray(map) {
    return Object.keys(map).map(id => map[id]);
  }
};


