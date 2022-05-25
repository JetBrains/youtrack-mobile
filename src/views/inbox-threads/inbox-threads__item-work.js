/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import StreamWork from 'components/activity-stream/activity__stream-work';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconWork} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup} from 'flow/Inbox';
import type {Activity} from '../../flow/Activity';
import StreamHistoryChange from '../../components/activity-stream/activity__stream-history';

interface Props {
  group: InboxThreadGroup;
}

export default function ThreadWorkItem({group}: Props): React$Element<typeof View> {
  return (
    <View>
      <View style={styles.threadConnector}/>
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          <IconWork size={24} color={styles.icon.color} style={styles.activityWorkIcon}/>
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(group.head.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>{i18n('updated')}</Text>
            <StreamTimestamp timestamp={group.work.timestamp}/>
          </View>
        </View>
      </View>

      <View style={styles.threadChange}>
        <StreamWork activityGroup={{work: group.work}}/>
        {group.mergedActivities.map(
          (activity: Activity) => <StreamHistoryChange key={activity.id} activity={activity}/>
        )}
      </View>
    </View>
  );
}
