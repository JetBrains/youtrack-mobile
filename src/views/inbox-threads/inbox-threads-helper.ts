import {doSortBy, sortByTimestamp} from 'components/search/sorting';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';

import type {Activity} from 'types/Activity';
import type {InboxThread, InboxThreadMessage, InboxThreadTarget} from 'types/Inbox';

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
): Record<string, Activity> | null {
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

export type ThreadTypeData = {
  isMention: boolean,
  isReaction: boolean,
  isSubscription: boolean,
};

const getThreadTypeData = (it: InboxThread | InboxThreadMessage): ThreadTypeData => {
  return {
    isSubscription: it.id[0] === 'S',
    isMention: it.id[0] === 'M',
    isReaction: it.id[0] === 'R',
  };
};

function mergeThreads(threads: InboxThread[]): InboxThread[] {
  const subscriptionThreads: InboxThread[] = threads.filter((it: InboxThread) => getThreadTypeData(it).isSubscription);
  const directThreads: InboxThread[] = threads.filter((it: InboxThread) => !getThreadTypeData(it).isSubscription);
  let mergedSubscriptionsThreads: InboxThread[] = subscriptionThreads;
  const sMap: Record<string, InboxThread> = {};
  const dMap: Record<string, InboxThread> = directThreads.reduce(
    (akk: Record<string, InboxThread>, it: InboxThread) => {
      const iTarget: InboxThreadTarget = it.subject.target;
      const iEntity = iTarget?.issue || iTarget?.article || iTarget;
      const curr = akk[iEntity.id];
      if (curr) {
        curr.messages = curr.messages.concat(it.messages);
        curr.latestTimestamp = Math.max.apply(null, curr.messages.map((it: InboxThreadMessage) => it.timestamp));
      } else {
        akk[iEntity.id] = it;
      }
      return akk;
    }, {});

  if (directThreads.length > 0) {
    mergedSubscriptionsThreads = subscriptionThreads.reduce((akk: InboxThread[], it: InboxThread) => {
      const target: InboxThreadTarget = it.subject.target;
      const entity = target?.issue || target?.article || target;
      sMap[entity.id] = it;

      const direct: InboxThread | undefined = dMap[entity?.id];
      const inboxThreadMessages = it.messages.slice(0);
      const messages = direct ? [...inboxThreadMessages, ...direct.messages].sort(sortByTimestamp).reverse() : inboxThreadMessages;
      return [...akk, {
        ...it,
        messages,
        lastTimestamp: it.messages.slice(0, 1)[0].timestamp,
      }];
    }, [] as InboxThread[]);
  }

  const orphans = Object.keys(dMap).reduce((akk, id: string) => {
    if (!sMap[id]) {
      akk.push({...dMap[id], lastTimestamp: dMap[id].notified});
    }
    return akk;
  }, []);
  return mergedSubscriptionsThreads.concat(orphans).sort((a, b) => {
    return doSortBy(a, b, 'lastTimestamp', true);
  });
}

export {
  createMessagesMap,
  folderIdAllKey,
  folderIdMap,
  getTypes,
  getThreadTypeData,
  getThreadTabsTitles,
  mergeThreads,
  sortEvents,
};
