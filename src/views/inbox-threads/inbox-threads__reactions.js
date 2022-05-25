/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import CommentReactions from 'components/comment/comment-reactions';
import ReactionIcon from 'components/reactions/reaction-icon';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';
import stylesInbox from '../inbox/inbox.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

interface Props {
  currentUser: User;
  style?: ViewStyleProp;
  thread: InboxThread;
  uiTheme: UITheme;
}

export default function InboxThreadReaction({
  thread,
  style,
  currentUser,
  uiTheme,
}: Props): React$Element<typeof View> {
  const activity: Activity = thread.messages[0].activities[0];
  const reaction: Reaction = activity.added[0] || activity.removed[0];
  const comment: ?IssueComment = activity?.comment;

  return (
    <View style={style}>
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          <ReactionIcon name={reaction.reaction} size={24}/>
          {activity.removed[0]?.reaction && <View style={stylesInbox.reactionIconRemoved}/>}
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(activity.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>
              {activity?.added[0]?.reaction && comment?.reactions?.length > 1
                ? comment?.reactions?.length === 1 ? i18n('added a reaction') : i18n('added reactions')
                : i18n('removed a reaction')}
            </Text>
            <StreamTimestamp timestamp={thread.notified}/>
          </View>
        </View>
      </View>
      <View style={[styles.threadChange, styles.threadChangeMarkdown]}>
        {!!comment && (
          <>
            <StreamComment
              activity={{
                ...activity,
                added: [comment],
              }}
            />
            <CommentReactions
              style={styles.threadCommentReactions}
              comment={comment}
              currentUser={currentUser}
            />
          </>
        )}
      </View>
    </View>
  );
}
