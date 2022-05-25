/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import ActivityUserAvatar from '../../components/activity-stream/activity__stream-avatar';
import ApiHelper from '../../components/api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';
import MarkdownViewChunks from '../../components/wiki/markdown-view-chunks';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getApi} from '../../components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';
import {markdownText} from '../../components/common-styles/typography';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

interface Props {
  currentUser: User;
  style?: ViewStyleProp;
  thread: InboxThread;
  uiTheme: UITheme;
}

export default function InboxThreadMention({
  thread,
  style,
  currentUser,
  uiTheme,
}: Props): ?React$Element<typeof View> {
  const activity: Activity = thread.messages[0].activities[0];
  activity.author = ApiHelper.convertRelativeUrl(activity.author, 'avatarUrl', getApi().config.backendUrl);
  let comment: ?IssueComment;
  let text: ?string;

  if (isActivityCategory.commentMention(activity)) {
    comment = activity.comment;
    text = comment?.text;
  } else if (isActivityCategory.issueMention(activity)) {
    text = activity?.issue?.description;
  } else if (isActivityCategory.articleCommentMention(activity)) {
    comment = activity?.comment;
    text = comment?.text;
  } else if (isActivityCategory.articleMention(activity)) {
    text = activity?.article?.content;
  }

  return !text ? null : (
    <View style={style}>
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          <ActivityUserAvatar
            activityGroup={{
              author: activity.author,
              timestamp: activity.timestamp,
            }}
            showAvatar={true}
            size={32}
            style={styles.threadTitleIcon}
          />
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(activity.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>
              {i18n('mentioned you')}
            </Text>
            <StreamTimestamp timestamp={thread.notified}/>
          </View>
        </View>
      </View>
      <View style={[styles.threadChange, styles.threadChangeMarkdown]}>
        <MarkdownViewChunks
          textStyle={markdownText}
          chunkSize={3}
          maxChunks={1}
          uiTheme={uiTheme}
        >
          {text}
        </MarkdownViewChunks>
        {!!comment && (
          <CommentReactions
            style={styles.threadCommentReactions}
            comment={comment}
            currentUser={currentUser}
          />
        )}
      </View>
    </View>
  );
}
