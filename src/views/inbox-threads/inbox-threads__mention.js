/* @flow */

import React from 'react';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import CommentReactions from 'components/comment/comment-reactions';
import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';
import {markdownText} from 'components/common-styles/typography';

import styles from './inbox-threads.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  thread: InboxThread;
  uiTheme: UITheme;
}

export default function InboxThreadMention({thread, currentUser, uiTheme}: Props) {
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

  return text ? (
    <ThreadItem
      author={activity.author}
      avatar={<Avatar
        userName={getEntityPresentation(activity.author)}
        size={30}
        source={{uri: activity.author.avatarUrl}}
      />}
      change={
        <>
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
        </>
      }
      // group={null}
      reason={i18n('mentioned you')}
      timestamp={thread.notified}
    />
  ) : null;
}
