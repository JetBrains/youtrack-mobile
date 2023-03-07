import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import InboxThreadReadToggleButton from './inbox-threads__read-toggle-button';
import SwipeableRow from 'components/swipeable/swipeable-row';
import ThreadCommentItem from './inbox-threads__item-comment';
import ThreadEntityCreatedItem from './inbox-threads__item-issue-created';
import ThreadHistoryItem from './inbox-threads__item-history';
import ThreadWorkItem from './inbox-threads__item-work';
import {createMessagesMap, sortEvents} from './inbox-threads-helper';
import {groupActivities} from 'components/activity/activity__group-activities';
import {i18n} from 'components/i18n/i18n';
import {mergeActivities} from 'components/activity/activity__merge-activities';
import {sortByTimestamp} from 'components/search/sorting';
import {splitActivities} from 'components/activity/activity__split-activities';

import styles from './inbox-threads.styles';

import type {Activity} from 'types/Activity';
import type {
  InboxThread,
  InboxThreadGroup,
  InboxThreadMessage,
  ThreadEntity,
} from 'types/Inbox';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';


type Props = {
  currentUser: User;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
  onReadChange: (messages: InboxThreadMessage[], read: boolean) => any;
  style?: ViewStyleProp;
  thread: InboxThread;
  uiTheme: UITheme;
};
export default function InboxThreadItemSubscription({
  currentUser,
  onNavigate,
  onReadChange,
  style,
  thread,
  uiTheme,
}: Props): React.ReactElement<React.ComponentProps<typeof View>, typeof View> {
  const [shownMessagesAmount, updateShownMessagesAmount] = useState(3);
  const activityToMessageMap = createMessagesMap(thread.messages);
  const activities: Activity[] = thread.messages.reduce(
    (list, it) => list.concat(it.activities),
    [],
  );
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

  const splittedMessageGroups = messageGroups
    .map(group => {
      group.events = sortEvents(group.events);
      const mergedActivities = mergeActivities(group.events).sort(
        sortByTimestamp,
      );
      return splitActivities(mergedActivities, group.activityToMessageMap);
    })
    .filter(splittedGroup => splittedGroup.length > 0)
    .reduce((acc, it) => acc.concat(it), []);

  if (splittedMessageGroups.length < 1) {
    return null;
  }

  return (
    <View
      testID="test:id/inboxThreadsSubscription"
      accessibilityLabel="inboxThreadsSubscription"
      accessible={true}
      style={style}
    >
      {splittedMessageGroups
        .slice(0, shownMessagesAmount)
        .map((group: InboxThreadGroup, idx: number) => {
          return renderGroup(
            group,
            thread.subject.target,
            splittedMessageGroups.length - 1 === idx,
            splittedMessageGroups.length > shownMessagesAmount &&
              idx === shownMessagesAmount - 1 && (
                <TouchableOpacity
                  testID="test:id/inboxThreadsSubscriptionShowMore"
                  accessibilityLabel="inboxThreadsSubscriptionShowMore"
                  accessible={true}
                  style={[styles.threadButton, styles.threadButtonMore]}
                  onPress={() =>
                    updateShownMessagesAmount(splittedMessageGroups.length + 1)
                  }
                >
                  <Text style={styles.threadButtonText}>
                    {i18n('Show more')}
                  </Text>
                </TouchableOpacity>
              ),
          );
        })}
    </View>
  );

  function renderGroup(
    group: InboxThreadGroup,
    target: any,
    isLast: boolean,
    showMoreButtonEl?: any,
  ) {
    let Component: any;

    switch (true) {
      case !!group.issue:
        Component = ThreadEntityCreatedItem;
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
      <View
        testID="test:id/inboxThreadsSubscriptionGroup"
        accessibilityLabel="inboxThreadsSubscriptionGroup"
        accessible={true}
        key={`${group.head.id}${group.head.timestamp}`}
      >
        {!isLast && <View style={styles.threadConnector} />}

        <InboxThreadReadToggleButton
          messages={group.messages}
          onReadChange={onReadChange}
        />

        <SwipeableRow
          leftActionText={i18n('Mark as unread')}
          onSwipeLeft={() => onReadChange(group.messages, false)}
          onSwipeRight={() => onReadChange(group.messages, true)}
          rightActionText={i18n('Mark as read')}
        >
          <View style={styles.threadContainer}>
            <>
              {!isLast && <View style={styles.threadConnector}/>}
              <Component
                target={target}
                group={group}
                isLast={isLast}
                currentUser={currentUser}
                uiTheme={uiTheme}
                onNavigate={onNavigate}
              />
            </>
          </View>
        </SwipeableRow>

        {showMoreButtonEl}
      </View>
    );
  }
}
