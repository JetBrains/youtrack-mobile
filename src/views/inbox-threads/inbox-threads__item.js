/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThreadGroup} from 'flow/Inbox';
import type {User} from 'flow/User';

interface Props {
  author: User;
  avatar: any;
  change?: any;
  group?: InboxThreadGroup;
  reason: string;
  timestamp: number;
  onPress?: () => any;
}

export default function ThreadItem({author, avatar, change, group, reason, timestamp, onPress}: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          {avatar}
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>{reason}</Text>
            <StreamTimestamp timestamp={timestamp}/>
          </View>
        </View>
      </View>

      <Wrapper style={styles.threadChange} {...Object.assign(onPress ? {onPress} : {})}>
        <>
          {change}
          {!!group?.mergedActivities?.length && (
            <View
              style={styles.threadRelatedChange}
            >
              {group.mergedActivities.map(
                (activity: Activity) => (
                  <StreamHistoryChange
                    key={`${group.head.id}${group.head.timestamp}${activity.id}`}
                    activity={activity}
                  />
                )
              )}
            </View>
          )}
        </>
      </Wrapper>
    </View>
  );
}
