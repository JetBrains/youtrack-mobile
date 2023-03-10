import {getTypes} from 'views/inbox-threads/inbox-threads-helper';

import {Activity} from 'types/Activity';

interface MergedItem {
  mergedActivities: Activity[];
  messages: Activity[];
  issue?: Activity;
  head?: Activity;
  article?: Activity;
  comment?: Activity;
  work?: Activity;
}


export function splitActivities(activities: Activity[], activityToMessageMap: Record<string, Activity>) {
  let mergedItem: MergedItem = {
    mergedActivities: [],
    messages: [],
  };
  const splittedActivities: MergedItem[] = [];
  let hasTerminated = false;
  activities.forEach((activity: Activity, index: number) => {
    const isType = getTypes(activity);
    const activityId = activity.id;

    if (
      isType.issueCreated ||
      isType.articleCreated ||
      isType.comment ||
      isType.work
    ) {
      if (hasTerminated) {
        splittedActivities.push(mergedItem);
        mergedItem = {
          mergedActivities: [],
          messages: [],
        };
      }

      switch (true) {
        case isType.issueCreated: {
          mergedItem.issue = activity;
          mergedItem.head = activity;
          break;
        }

        case isType.articleCreated: {
          mergedItem.article = activity;
          mergedItem.head = activity;
          break;
        }

        case isType.comment: {
          mergedItem.comment = activity;
          mergedItem.head = activity;
          break;
        }

        case isType.work: {
          mergedItem.work = activity;
          mergedItem.head = activity;
        }
      }

      mergedItem.messages.push(activityToMessageMap[activityId]);
      hasTerminated = true;
    } else {
      mergedItem.mergedActivities.push(activity);
      mergedItem.messages.push(activityToMessageMap[activityId]);
    }

    if (index === activities.length - 1) {
      if (!mergedItem.head) {
        mergedItem.head = mergedItem.mergedActivities[0];
      }

      splittedActivities.push(mergedItem);
    }
  });
  return splittedActivities;
}
