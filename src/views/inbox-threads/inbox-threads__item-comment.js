/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import ActivityUserAvatar from 'components/activity-stream/activity__stream-avatar';
import CommentReactions from 'components/comment/comment-reactions';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup} from 'flow/Inbox';
import type {Activity} from 'flow/Activity';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  group: InboxThreadGroup;
  isLast: boolean;
}

export default function ThreadCommentItem({group, isLast, currentUser}: Props): React$Element<typeof View> {
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
      <View style={[styles.threadChange, styles.threadChangeMarkdown]}>
        <StreamComment
          activity={group.comment}
        />
        <CommentReactions
          style={styles.threadCommentReactions}
          comment={group.comment.comment}
          currentUser={currentUser}
        />
        {group.mergedActivities.map(
          (activity: Activity) => <StreamHistoryChange key={activity.id} activity={activity}/>
        )}
      </View>
    </View>
  );
}
