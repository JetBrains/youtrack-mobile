/* @flow */

import {isActivityCategory} from 'components/activity/activity__category';

import type {Activity} from 'flow/Activity';
import type {AnyIssue} from 'flow/Issue';
import type {Article} from 'flow/Article';
import type {InboxThread, InboxThreadMessage} from 'flow/Inbox';

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
    date: isActivityCategory.date(activity),
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

function getThreadEntity(thread: InboxThread): (AnyIssue | Article) {
  let entity: any = null;
  const activity: Activity = thread.messages[0].activities[0];
  if (thread.id) {
    switch (thread.id[0]) {
    case 'R':
      entity = thread.subject.target.issue;
      break;
    case 'M':
      if (isActivityCategory.commentMention(activity)) {
        entity = activity.comment.issue;
      } else if (isActivityCategory.issueMention(activity)) {
        entity = activity.issue;
      } else if (isActivityCategory.articleCommentMention(activity)) {
        entity = activity.comment.article;
      } else if (isActivityCategory.articleMention(activity)) {
        entity = activity.article;
      }
      break;
    case 'S':
      entity = thread.subject.target;
    }
  }
  return entity;
}

export {
  createMessagesMap,
  getThreadEntity,
  getTypes,
  sortEvents,
};
