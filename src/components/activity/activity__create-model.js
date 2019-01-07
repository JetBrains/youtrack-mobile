/* @flow */
import ResourceTypes from '../api/api__resource-types';
import {Activity, isActivityCategory} from './activity__category';

const WORK_ICON = 'sand-watch';
const VCS_ICON = 'vcs';
const HISTORY_ICON = 'history-change';

export const createActivitiesModel = function (activityGroups: Array<Object>) {

  const activities = getStream(activityGroups)
    .map(function (streamGroup) {
      streamGroup.events = streamGroup.events.sort(sortByCategory);
      return streamGroup;
    })
    .map(addIconByType);

  return addMergeMetaDataToActivities(
    removeHiddenActivities(activities)
  );


  function getStream(activityGroups) {
    const createGroup = function (event, timestamp, authorGroup) {
      const streamGroup = {
        $type: ResourceTypes.EVENT_GROUP,
        timestamp: timestamp,
        events: [],
        authorGroup: authorGroup,
        author: event.author,
        work: null,
        key: '',
        comment: null,
        vcs: null
      };

      switch (true) {
      case isActivityCategory.work(event):
        event.icon = WORK_ICON;
        streamGroup.work = event;
        streamGroup.key = Activity.Source.WORK_ITEM;
        break;
      case isActivityCategory.vcs(event):
        event.icon = VCS_ICON;
        streamGroup.vcs = event;
        streamGroup.key = Activity.Source.VCS;
        break;
      case isActivityCategory.comment(event):
        streamGroup.comment = event;
        streamGroup.key = Activity.Source.COMMENT;
        break;
      default:
        streamGroup.key = Activity.Source.HISTORY;
      }

      return streamGroup;
    };

    const streamDataModel = [];

    const filterOutUnnecessaryEvents = function (event) {
      return (
        !isActivityCategory.voters(event) &&
        !isActivityCategory.totalVotes(event) &&
        !isActivityCategory.commentText(event)
      );
    };

    activityGroups.forEach(function (rawGroup) {
      let currentGroup;
      rawGroup.events = rawGroup.events.filter(filterOutUnnecessaryEvents);
      const events = rawGroup.events;

      if (!events || !events.length) {
        return;
      }

      let historyChanges = [];
      let isFirst = true;
      events.forEach(function (event) {
        if (
          isActivityCategory.comment(event) ||
          isActivityCategory.work(event) ||
          isActivityCategory.vcs(event)
        ) {
          if (currentGroup && historyChanges.length && !isFirst) {
            currentGroup.events = historyChanges.slice(0);
            historyChanges = [];
          }

          currentGroup = createGroup(event, rawGroup.timestamp, rawGroup.authorGroup);
          isFirst = false;
          streamDataModel.push(currentGroup);
        } else {
          historyChanges.push(event);
        }
      });

      if (currentGroup) {
        if (historyChanges.length) {
          currentGroup.events = currentGroup.events.concat(historyChanges);
        }
      } else {
        if (rawGroup.category ? isActivityCategory.comment(rawGroup) : itemHasType(rawGroup, ResourceTypes.ISSUE_COMMENT)) {
          rawGroup.comment = {...rawGroup.events[0]};
        }
        streamDataModel.push(rawGroup);
      }
    });

    return streamDataModel.map(mergeAttachmentEvents);
  }

  function itemHasType(item, entityType): boolean {
    if (!item) {
      return false;
    }

    let type;
    if (Array.isArray(item.events) && item.events.length) {
      const event = item.events[0];
      type = (event.target || {}).$type;
    } else {
      type = item.$type;
    }

    return type === entityType;
  }


  function removeHiddenActivities(activities: Array<Object>): Array<Object> {
    return activities.filter((it: Object) => !it.hidden);
  }

  function addMergeMetaDataToActivities(activities) {
    let currentIndex = activities.length - 1;
    let activity = null;
    let prevActivity = null;
    let lastGroup = true;

    reset();

    while (currentIndex >= 0) {
      activity = activities[currentIndex];
      prevActivity = activities[currentIndex - 1];
      activity.merged = isMergedActivity(activity, prevActivity);

      if (prevActivity) {
        if (activity.merged) {
          prevActivity.root = true;
          delete activity.root;
        } else {
          activity.root = true;
        }
      } else if (!activity.merged) {
        activity.root = true;
      }

      if (lastGroup) {
        activity.lastGroup = true;
        if (!activity.merged && activity.root) {
          lastGroup = null;
        }
      }

      currentIndex--;
    }

    return activities;


    function reset() {
      activities.forEach((it) => {
        delete it.root;
        delete it.merged;
        delete it.lastGroup;
      });
    }

    function isMergedActivity(activity, prevActivity) {
      return !!(
        prevActivity &&
        !activity.comment &&
        activity.author.id === prevActivity.author.id &&
        getActivityTypeId(activity) === getActivityTypeId(prevActivity)
      );

    }

    function getActivityTypeId(item) {
      return item && item.key;
    }
  }

  function sortByCategory(item1, item2) {
    if (item1.category.$type < item2.category.$type) {
      return 1;
    }
    if (item1.category.$type > item2.category.$type) {
      return -1;
    }

    return 0;
  }

  function mergeAttachmentEvents(streamGroup: Object) {
    if (!streamGroup.events.length) {
      return streamGroup;
    }

    let attachmentEvents = streamGroup.events.filter(function (event) {
      return isActivityCategory.attachment(event);
    });

    if (!attachmentEvents.length) {
      return streamGroup;
    }

    streamGroup.events = streamGroup.events.reduce((list, event) => { //remove attachmentEvents
      if (!attachmentEvents.some(it => it.id === event.id)) {
        list.push(event);
      }
      return list;
    }, []);


    const commentEvent = streamGroup.comment;
    if (commentEvent && commentEvent.added.length) {
      const comment = commentEvent.added[0];
      attachmentEvents = removeAddEventsAboutCommentAttachments(comment, attachmentEvents);
    }

    if (attachmentEvents.length) {
      const reversedAttachEvents = attachmentEvents.slice(0).reverse();
      const mergedAttachEvent = reversedAttachEvents.pop();
      reversedAttachEvents.forEach(function (event) {
        mergedAttachEvent.added = mergedAttachEvent.added.concat(event.added);
        mergedAttachEvent.removed = mergedAttachEvent.removed.concat(event.removed);
      });
      streamGroup.events.push(mergedAttachEvent);
    }

    return streamGroup;
  }

  function removeAddEventsAboutCommentAttachments(comment, attachEvents) {
    const attachments = comment.attachments;
    if (attachments && attachments.length) {
      const idsMap = attachments.filter(function (attachment) {
        return !attachment.removed;
      }).reduce(function (idsMap, attachment) {
        idsMap[attachment.id] = true;
        return idsMap;
      }, {});
      return attachEvents.filter(function (activity) {
        return (attachEvents.removed && attachEvents.removed.length)
          || !idsMap[activity.target.id];
      });
    }

    return attachEvents;
  }

  function addIconByType(group) {
    let type = null;
    for (let i = 0; i < group.events.length; i++) {
      const event = group.events[i];
      if (type !== event.category.$type) {
        if (isActivityCategory.work(event)) {
          event.icon = WORK_ICON;
        }
        if (isActivityCategory.vcs(event)) {
          event.icon = VCS_ICON;
        } else {
          event.icon = HISTORY_ICON;
          break;
        }
        type = event.category.$type;
      }
    }
    return group;
  }
};




