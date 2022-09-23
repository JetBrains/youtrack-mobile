/* @flow */

import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import {isActivityCategory} from 'components/activity/activity__category';
import {i18n} from 'components/i18n/i18n';

import type {Activity} from 'flow/Activity';
import type {InboxThread, InboxThreadMessage, ThreadData} from 'flow/Inbox';

function getTypes(activity: Activity): { [string]: boolean } {
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


function createMessagesMap(messages: InboxThreadMessage[] = []): ?{ [string]: Activity } {
  if (!messages.length) {
    return null;
  }
  const map: { [string]: Object } = {};
  messages.forEach(message => {
    message.activities && message.activities.forEach(activity => {
      map[activity.id] = message;
    });
  });
  return map;
}

function sortEvents(events: Activity[]): Activity[] {
  let projectEvent: ?Activity;
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
  return sortedEvents.concat(events.slice(0, i)).concat(events.slice(i + 1, events.length));
}

function getThreadData(thread: InboxThread): ThreadData {
  const threadData: ThreadData = {entity: null, component: null, entityAtBottom: false};
  if (thread.id) {
    const target = thread.subject.target;
    threadData.entity = target?.issue || target?.article || target;
    switch (thread.id[0]) {
    case 'R':
      threadData.component = InboxThreadReaction;
      threadData.entityAtBottom = true;
      break;
    case 'M':
      threadData.component = InboxThreadMention;
      threadData.entityAtBottom = true;
      break;
    case 'S':
      threadData.component = InboxThreadItemSubscription;
    }
  }
  return threadData;
}

const getThreadTabsTitles: () => string[] = () => [
  i18n('All'),
  i18n('Mentions & Reactions'),
  i18n('Subscriptions'),
];

const folderIdAllKey: string = 'all';

const folderIdMap: { [number]: string } = {
  [0]: undefined,
  [1]: 'direct',
  [2]: 'subscription',
};

export {
  createMessagesMap,
  folderIdAllKey,
  folderIdMap,
  getThreadData,
  getTypes,
  getThreadTabsTitles,
  sortEvents,
};
