/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThreadGroup} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroup;
  isLast: boolean;
}

export default function ThreadHistoryItem({group, isLast}: Props) {
  return (
    <View>
      {!isLast && <View style={styles.threadConnector}/>}
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          <IconHistory size={16} color={styles.icon.color}/>
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(group.head.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>{i18n('updated')}</Text>
            <StreamTimestamp timestamp={group.head.timestamp}/>
          </View>
        </View>
      </View>
      <View style={styles.threadChange}>
        {group.mergedActivities.map(
          (activity: Activity) => <StreamHistoryChange key={activity.id} activity={activity}/>)}
      </View>
    </View>
  );
}
