/* @flow */

import React from 'react';
import {View} from 'react-native';

import ThreadCommentItem from './inbox-threads__item-comment';
import ThreadHistoryItem from './inbox-threads__item-history';
import ThreadIssueCreatedItem from './inbox-threads__item-issue-created';
import ThreadWorkItem from './inbox-threads__item-work';
import {createMessagesMap, sortEvents} from './inbox-threads-helper';
import {groupActivities} from 'components/activity/activity__group-activities';
import {mergeActivities} from 'components/activity/activity__merge-activities';
import {splitActivities} from 'components/activity/activity__split-activities';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread, InboxThreadGroup} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export default function InboxThreadItemSubscription({
  thread,
  style,
  currentUser,
  uiTheme,
}: { thread: InboxThread, style?: ViewStyleProp, currentUser: User, uiTheme: UITheme}): React$Element<typeof View> {
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
      {splittedMessageGroups.map((group: InboxThreadGroup, idx: number) => {
        return renderGroup(group, thread.subject.target, (splittedMessageGroups.length - 1) === idx);
      })}
    </View>
  );

  function renderGroup(group: InboxThreadGroup, target: any, isLast: boolean) {
    let Component: any;
    switch (true) {
    case !!group.issue:
      Component = ThreadIssueCreatedItem;
      break;
    case !!group.comment:
      Component = ThreadCommentItem;
      break;
    case !!group.work:
      Component = ThreadWorkItem;
      break;
    default:
      Component = ThreadHistoryItem;
    }
    return (
      <View key={`${group.head.id}${group.head.timestamp}`}>
        {!isLast && <View style={styles.threadConnector}/>}
        <Component
          group={group}
          isLast={isLast}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      </View>
    );
  }
}

