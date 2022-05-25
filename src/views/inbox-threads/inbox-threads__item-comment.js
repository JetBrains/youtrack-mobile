/* @flow */

import React from 'react';

import ActivityUserAvatar from 'components/activity-stream/activity__stream-avatar';
import ApiHelper from 'components/api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup} from 'flow/Inbox';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  group: InboxThreadGroup;
}

export default function ThreadCommentItem({group, currentUser}: Props) {
  group.comment.author = ApiHelper.convertRelativeUrl(
    group.comment.author, 'avatarUrl', getApi().config.backendUrl
  );

  return (
    <ThreadItem
      author={group.comment.author}
      avatar={<ActivityUserAvatar
        activityGroup={{
          author: group.comment.author,
          timestamp: group.comment.timestamp,
        }}
        showAvatar={true}
        size={30}
        style={styles.threadTitleIcon}
      />}
      change={<>
        <StreamComment
          activity={group.comment}
        />
        <CommentReactions
          style={styles.threadCommentReactions}
          comment={group.comment.comment}
          currentUser={currentUser}
        />
      </>}
      group={group}
      reason={i18n('commented')}
      timestamp={group.comment.timestamp}
    />
  );
}
