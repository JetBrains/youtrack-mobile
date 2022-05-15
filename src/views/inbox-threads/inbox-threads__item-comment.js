/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import ActivityUserAvatar from 'components/activity-stream/activity__stream-avatar';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';

import type {InboxThreadGroupComment} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroupComment;
  isLast: boolean;
}

export default function ThreadCommentItem({group, isLast}: Props) {
  return (
    <View>
      {!isLast && <View style={styles.threadConnector}/>}
      <View style={styles.row}>
        <ActivityUserAvatar
          activityGroup={{
            author: group.comment.author,
            timestamp: group.comment.timestamp,
          }}
          showAvatar={true}
          size={32}
          style={styles.threadTitleIcon}
        />
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(group.comment.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>{i18n('commented')}</Text>
            <StreamTimestamp timestamp={group.comment.timestamp}/>
          </View>
        </View>
      </View>
      <View style={styles.threadChange}>
        <StreamComment
          activity={group.comment}
        />
      </View>
    </View>
  );
}
