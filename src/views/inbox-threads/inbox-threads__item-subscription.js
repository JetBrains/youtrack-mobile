/* @flow */

import React from 'react';
import {View} from 'react-native';

import InboxIssue from '../inbox/inbox__issue';
import ThreadCommentItem from './inbox-threads__item-comment';
import ThreadHistoryItem from './inbox-threads__item-history';
import {createMessagesMap, sortEvents} from './inbox-threads-helper';
import {groupActivities} from 'components/activity/activity__group-activities';
import {guid} from 'util/util';
import {mergeActivities} from 'components/activity/activity__merge-activities';
import {splitActivities} from 'components/activity/activity__split-activities';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread, InboxThreadGroup, InboxThreadGroupComment} from 'flow/Inbox';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export default function InboxThreadItemSubscription({thread, style}: { thread: InboxThread, style?: ViewStyleProp }) {
  const activityToMessageMap = createMessagesMap(thread.messages);
  const activities: Array<Activity> = thread.messages.reduce((list, it) => list.concat(it.activities), []);
  const messageGroups = groupActivities(activities.reverse(), {

    onAddActivityToGroup: (group, activity: Activity) => {
      group.messages = group.messages ? group.messages : [];
      if (activityToMessageMap[activity?.id]) {
        group.messages.push(activityToMessageMap[activity.id]);
      }
    },
    onCompleteGroup: group => {
      group.activityToMessageMap = activityToMessageMap;
    },

  }).reverse();

  if (messageGroups.length < 1) {
    return null;
  }

  const splittedMessageGroups = messageGroups.map(group => {
    group.events = sortEvents(group.events);
    const mergedActivities = mergeActivities(group.events);
    return splitActivities(mergedActivities, group.activityToMessageMap);
  }).filter(splittedGroup => splittedGroup.length > 0).reduce((acc, it) => acc.concat(it), []);

  if (splittedMessageGroups.length < 1) {
    return null;
  }

  return (
    <View style={style}>
      <InboxIssue
         issue={thread.subject.target}
         onNavigateToIssue={() => {}}
         style={styles.threadTitle}
      />
      {splittedMessageGroups.map((group: InboxThreadGroup, idx: number) => {
        return renderGroup(group, thread.subject.target, (splittedMessageGroups.length - 1) === idx);
      })}
    </View>
  );
}

function renderGroup(group: InboxThreadGroupComment | InboxThreadGroup, target: any, isLast: boolean) {
  const key: string = guid();
  let Component: any = ThreadHistoryItem;
  switch (true) {
  case !!group.comment:
    Component = ThreadCommentItem;
    break;
  }
  return <Component key={key} group={group} isLast={isLast}/>;
}

