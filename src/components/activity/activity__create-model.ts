import {ActivityCategory, isActivityCategory} from './activity__category';
import {ResourceTypes, hasType} from '../api/api__resource-types';
import {sortByTimestamp} from 'components/search/sorting';

import {Activity, ActivityGroup} from 'types/Activity';


export const createActivitiesModel = (activityGroups: ActivityGroup[] = []): Activity[] => {
  const activities = getStream(activityGroups).map(streamGroup => {
    streamGroup.events = streamGroup.events
      .sort(sortByCategory)
      .sort(sortByTimestamp);
    return streamGroup;
  });
  return addMergeMetaDataToActivities(removeHiddenActivities(activities));

  function getStream(activityGroups: ActivityGroup[]) {
    const createGroup = (event, timestamp, authorGroup) => {
      const streamGroup = {
        $type: ResourceTypes.EVENT_GROUP,
        timestamp: timestamp,
        events: [],
        authorGroup: authorGroup,
        author: event?.author,
        work: null,
        key: '',
        comment: null,
        vcs: null,
        target: null,
        id: event.id,
      };

      switch (true) {
        case isActivityCategory.work(event):
          streamGroup.work = event;
          streamGroup.key = ActivityCategory.Source.WORK_ITEM;
          break;

        case isActivityCategory.comment(event):
          streamGroup.comment = event;
          streamGroup.target = event?.target;
          streamGroup.key = ActivityCategory.Source.COMMENT;
          break;

        case isActivityCategory.vcs(event) ||
          isActivityCategory.pullRequest(event):
          streamGroup.vcs = event;
          streamGroup.target = event?.target;
          streamGroup.key = ActivityCategory.Source.VCS_ITEM;
          break;

        default:
          streamGroup.key = ActivityCategory.Source.HISTORY;
      }

      return streamGroup;
    };

    const streamDataModel = [];

    const filterOutUnnecessaryEvents = event =>
      !isActivityCategory.voters(event) &&
      !isActivityCategory.totalVotes(event) &&
      !isActivityCategory.commentText(event);

    activityGroups.forEach(rawGroup => {
      let currentGroup;
      rawGroup.events = rawGroup.events.filter(filterOutUnnecessaryEvents);
      const events = rawGroup.events;

      if (!events || !events.length) {
        return;
      }

      let historyChanges = [];
      let isFirst = true;
      events.forEach(event => {
        if (
          isActivityCategory.comment(event) ||
          isActivityCategory.work(event) ||
          isActivityCategory.vcs(event) ||
          isActivityCategory.pullRequest(event)
        ) {
          if (currentGroup && historyChanges.length && !isFirst) {
            currentGroup.events = historyChanges.slice(0);
            historyChanges = [];
          }

          currentGroup = createGroup(
            event,
            rawGroup.timestamp,
            rawGroup.authorGroup,
          );
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
        if (isComment(rawGroup)) {
          rawGroup.comment = {...rawGroup.events[0]};
        }

        streamDataModel.push(rawGroup);
      }
    });
    return streamDataModel.map(mergeAttachmentEvents);
  }

  function isComment(rawGroup) {
    if (rawGroup.category) {
      return isActivityCategory.comment(rawGroup);
    }

    let entity = rawGroup;

    if (Array.isArray(rawGroup.events) && rawGroup.events.length) {
      entity = (rawGroup.events[0] || {}).target;
    }

    return hasType.comment(entity);
  }

  function removeHiddenActivities(
    activities: Array<Record<string, any>>,
  ): Array<Record<string, any>> {
    return activities.filter((it: Record<string, any>) => !it.hidden);
  }

  function addMergeMetaDataToActivities(activities = []) {
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
      activities.forEach(it => {
        delete it.root;
        delete it.merged;
        delete it.lastGroup;
      });
    }

    function isMergedActivity(activity: Activity, prevActivity: Activity) {
      return !!(
        prevActivity &&
        activity.author.id === prevActivity.author.id &&
        getActivityTypeId(activity) === getActivityTypeId(prevActivity) &&
        ((!activity.comment && !activity.vcs) ||
          (!activity?.vcs?.pullRequest && !prevActivity?.vcs?.pullRequest))
      );
    }

    function getActivityTypeId(item: Activity) {
      return item && item.key;
    }
  }

  function sortByCategory(item1, item2) {
    if (item1.category.id < item2.category.id) {
      return 1;
    }

    if (item1.category.id > item2.category.id) {
      return -1;
    }

    return 0;
  }

  function mergeAttachmentEvents(streamGroup: Record<string, any>) {
    if (!streamGroup.events.length) {
      return streamGroup;
    }

    let attachmentEvents = streamGroup.events.filter(event =>
      isActivityCategory.attachment(event),
    );

    if (!attachmentEvents.length) {
      return streamGroup;
    }

    streamGroup.events = streamGroup.events.reduce((list, event) => {
      //remove attachmentEvents
      if (!attachmentEvents.some(it => it.id === event.id)) {
        list.push(event);
      }

      return list;
    }, []);
    const commentEvent = streamGroup.comment;

    if (commentEvent && commentEvent.added.length) {
      const comment = commentEvent.added[0];
      attachmentEvents = removeAddEventsAboutCommentAttachments(
        comment,
        attachmentEvents,
      );
    }

    if (attachmentEvents.length) {
      const reversedAttachEvents = attachmentEvents.slice(0).reverse();
      const mergedAttachEvent = reversedAttachEvents.pop();
      reversedAttachEvents.forEach(event => {
        mergedAttachEvent.added = mergedAttachEvent.added.concat(event.added);
        mergedAttachEvent.removed = mergedAttachEvent.removed.concat(
          event.removed,
        );
      });
      streamGroup.events.push(mergedAttachEvent);
    }

    return streamGroup;
  }

  function removeAddEventsAboutCommentAttachments(comment, attachEvents) {
    const attachments = comment.attachments;

    if (attachments && attachments.length) {
      const idsMap = attachments
        .filter(attachment => !attachment.removed)
        .reduce((idsMap, attachment) => {
          idsMap[attachment.id] = true;
          return idsMap;
        }, {});
      return attachEvents.filter(
        activity =>
          (attachEvents.removed && attachEvents.removed.length) ||
          !idsMap[activity.target.id],
      );
    }

    return attachEvents;
  }
};
