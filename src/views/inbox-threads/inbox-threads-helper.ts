import {isActivityCategory} from 'components/activity/activity__category';
import {i18n} from 'components/i18n/i18n';
import type {Activity} from 'flow/Activity';
import type {InboxThreadMessage} from 'flow/Inbox';

function getTypes(
  activity: Activity,
): {
  articleCreated: boolean;
  attach: boolean;
  comment: boolean;
  commentText: boolean;
  customField: boolean;
  description: boolean;
  issueCreated: boolean;
  issueResolved: boolean;
  link: boolean;
  project: boolean;
  sprint: boolean;
  star: boolean;
  summary: boolean;
  tag: boolean;
  totalVotes: boolean;
  visibility: boolean;
  voter: boolean;
  work: any;
} {
  return {
    attach: isActivityCategory.attachment(activity),
    comment: isActivityCategory.comment(activity),
    commentText: isActivityCategory.commentText(activity),
    link: isActivityCategory.link(activity),
    tag: isActivityCategory.tag(activity),
    summary: isActivityCategory.summary(activity),
    description: isActivityCategory.description(activity),
    sprint: isActivityCategory.sprint(activity),
    issueResolved: isActivityCategory.issueResolved(activity),
    project: isActivityCategory.project(activity),
    customField: isActivityCategory.customField(activity),
    work: isActivityCategory.work(activity),
    visibility: isActivityCategory.visibility(activity),
    voter: isActivityCategory.voters(activity),
    totalVotes: isActivityCategory.totalVotes(activity),
    issueCreated: isActivityCategory.issueCreated(activity),
    articleCreated: isActivityCategory.articleCreated(activity),
    star: isActivityCategory.star(activity),
  };
}

function createMessagesMap(
  messages: InboxThreadMessage[] = [],
): Record<string, Activity> | null | undefined {
  if (!messages?.length) {
    return null;
  }

  const map: Record<string, Record<string, any>> = {};
  messages.forEach(message => {
    message.activities &&
      message.activities.forEach(activity => {
        map[activity.id] = message;
      });
  });
  return map;
}

function sortEvents(events: Activity[]): Activity[] {
  let projectEvent: Activity | null | undefined;
  let i;

  for (i = 0; i < events.length; i++) {
    if (getTypes(events[i]).project) {
      projectEvent = events[i];
      break;
    }
  }

  if (!projectEvent) {
    return events;
  }

  const sortedEvents = [events[i]];
  return sortedEvents
    .concat(events.slice(0, i))
    .concat(events.slice(i + 1, events.length));
}

const getThreadTabsTitles: () => string[] = () => [
  i18n('All'),
  i18n('Mentions & Reactions'),
  i18n('Subscriptions'),
];

const folderIdAllKey: string = 'all';
const folderIdMap: Record<number, string> = {
  [0]: undefined,
  [1]: 'direct',
  [2]: 'subscription',
};
export {
  createMessagesMap,
  folderIdAllKey,
  folderIdMap,
  getTypes,
  getThreadTabsTitles,
  sortEvents,
};