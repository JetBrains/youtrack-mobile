import {getTypes} from 'views/inbox-threads/inbox-threads-helper';

import {Activity} from 'types/Activity';

interface MergedItem {
  activities: Activity[];
  messages: Activity[];
  issue?: Activity;
  head?: Activity;
  article?: Activity;
  comment?: Activity;
  work?: Activity;
}

export function splitByHead(activities: Activity[], activityToMessageMap: Record<string, Activity>) {
  const subgroups: MergedItem[] = [];
  let subgroup: MergedItem = {
    activities: [],
    messages: [],
  };
  let hasTerminated = false;
  activities.forEach((activity, index) => {
    const isType = getTypes(activity);
    const activityId = activity.id;
    if (isType.issueCreated || isType.articleCreated || isType.comment || isType.work) {
      if (hasTerminated) {
        subgroups.push(subgroup);
        subgroup = {activities: [], messages: []};
      }
      switch (true) {
        case isType.issueCreated: {
          subgroup.issue = activity;
          subgroup.head = activity;
          break;
        }
        case isType.articleCreated: {
          subgroup.article = activity;
          subgroup.head = activity;
          break;
        }
        case isType.comment: {
          subgroup.comment = activity;
          subgroup.head = activity;
          break;
        }
        case isType.work: {
          subgroup.work = activity;
          subgroup.head = activity;
        }
      }
      subgroup.messages.push(activityToMessageMap[activityId]);
      hasTerminated = true;
    } else {
      subgroup.activities.push(activity);
      subgroup.messages.push(activityToMessageMap[activityId]);
    }

    if (index === activities.length - 1) {
      if (!subgroup.head) {
        subgroup.head = subgroup.activities[0];
      }
      subgroups.push(subgroup);
    }
  });

  return subgroups;
}
