/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import ActivityUserAvatar from '../../components/activity-stream/activity__stream-avatar';
import ApiHelper from '../../components/api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';
import InboxIssue from '../inbox/inbox__issue';
import MarkdownViewChunks from '../../components/wiki/markdown-view-chunks';
import Router from 'components/router/router';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getApi} from '../../components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';
import {markdownText} from '../../components/common-styles/typography';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {AnyIssue} from 'flow/Issue';
import type {Article} from 'flow/Article';
import type {InboxThread} from 'flow/Inbox';
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
  let entity: (AnyIssue | Article);
  activity.author = ApiHelper.convertRelativeUrl(activity.author, 'avatarUrl', getApi().config.backendUrl);
  let comment;
  let text;

  if (isActivityCategory.commentMention(activity)) {
    comment = activity.comment;
    text = comment.text;
    entity = comment.issue;
  } else if (isActivityCategory.issueMention(activity)) {
    text = activity.issue.description;
    entity = activity.issue;
  } else if (isActivityCategory.articleCommentMention(activity)) {
    comment = activity.comment;
    text = comment.text;
    entity = comment.article;
  } else if (isActivityCategory.articleMention(activity)) {
    text = activity.article.content;
    entity = activity.article;
  } else {
    return null;
  }

  return (
    <View style={style}>
      <InboxIssue
        issue={entity}
        onNavigateToIssue={() => Router.Issue({issueId: entity.id, navigateToActivity: true})}
        style={styles.threadTitle}
      />

      <View>
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
          {!!comment && <CommentReactions
            style={styles.threadCommentReactions}
            comment={comment}
            currentUser={currentUser}
          />}
        </View>
      </View>

    </View>
  );
}
