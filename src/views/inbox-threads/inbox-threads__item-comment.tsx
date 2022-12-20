/* @flow */

import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadAddReactionButton from './inbox-threads__item-comment-add-reaction-button';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {firstActivityChange} from '../../components/activity-stream/activity__stream-helper';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {HIT_SLOP} from '../../components/common-styles/button';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';

import type {Attachment} from 'flow/Attachment';
import type {InboxThreadGroup, InboxThreadTarget, ThreadEntity} from 'flow/Inbox';
import type {UserCurrent} from 'flow/User';

type Props = {
  currentUser: UserCurrent;
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: string) => any;
}

export default function ThreadCommentItem({group, currentUser, target, onNavigate}: Props) {
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);

  const attachments: Attachment[] = firstActivityChange(group.comment)?.attachments || [];
  return (
    <>
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
          <StreamComment activity={group.comment} attachments={attachments} hideVisibility={true}/>
          <ThreadCommentReactions
            activity={group.comment}
            currentUser={currentUser}
            isPanelVisible={isReactionPanelVisible}
          />
        </>}
        group={group}
        reason={i18n('commented')}
        timestamp={group.comment.timestamp}
      />
      <View style={styles.threadChangeActions}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          style={styles.threadButton}
          onPress={() => {
            onNavigate(target, group.comment.id);
          }}
        >
          <Text style={styles.threadButtonText}>{i18n('View comment')}</Text>
        </TouchableOpacity>
        <ThreadAddReactionButton
          onPress={() => updateReactionPanelVisible(true)}
        />
      </View>
    </>
  );
}
