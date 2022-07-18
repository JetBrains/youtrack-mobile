/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import Router from 'components/router/router';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import styles from './inbox-threads.styles';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';

import type {InboxThreadGroup, InboxThreadTarget, ThreadEntity} from 'flow/Inbox';
import type {UserCurrent} from 'flow/User';

interface Props {
  currentUser: UserCurrent;
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onPress?: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
}

export default function ThreadCommentItem({group, currentUser, target, onPress}: Props) {

  return (
    <ThreadItem
      author={group.comment.author}
      avatar={<Avatar
        userName={getEntityPresentation(group.comment.author)}
        size={30}
        source={{uri: ApiHelper.convertRelativeUrl(
            group.comment.author, 'avatarUrl', getApi().config.backendUrl
          ).avatarUrl}}
      />}
      change={<>
        <StreamComment activity={group.comment}/>
        <ThreadCommentReactions activity={group.comment} currentUser={currentUser}/>
        <TouchableOpacity
          style={styles.threadButton}
          onPress={() => {
            if (onPress) {
              onPress(target, true);
            } else {
              if (hasType.article(target)) {
                Router.Article({articlePlaceholder: target, navigateToActivity: true});
              } else {
                Router.Issue({issueId: target.id, navigateToActivity: true});
              }
            }
          }}
        >
          <Text style={styles.threadButtonText}>{i18n('View comment')}</Text>
        </TouchableOpacity>
      </>}
      group={group}
      reason={i18n('commented')}
      timestamp={group.comment.timestamp}
    />
  );
}
