/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import styles from './inbox-threads.styles';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';

import type {InboxThreadGroup, InboxThreadTarget, ThreadEntity} from 'flow/Inbox';
import type {UserCurrent} from 'flow/User';

interface Props {
  currentUser: UserCurrent;
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
}

export default function ThreadCommentItem({group, currentUser, target, onNavigate}: Props) {

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
      change={<View style={styles.threadChangeWrapper}>
        <StreamComment activity={group.comment} attachments={group.comment.attachments}/>
        <ThreadCommentReactions activity={group.comment} currentUser={currentUser}/>
        <TouchableOpacity
          style={styles.threadButton}
          onPress={() => onNavigate(target, true)}
        >
          <Text style={styles.threadButtonText}>{i18n('View comment')}</Text>
        </TouchableOpacity>
      </View>}
      group={group}
      reason={i18n('commented')}
      timestamp={group.comment.timestamp}
    />
  );
}
