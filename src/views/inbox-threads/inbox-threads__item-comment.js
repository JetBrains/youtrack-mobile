/* @flow */

import React from 'react';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import CommentReactions from 'components/comment/comment-reactions';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
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
      avatar={<Avatar
        userName={getEntityPresentation(group.comment.author)}
        size={30}
        source={{uri: group.comment.author.avatarUrl}}
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
