/* @flow */

import React from 'react';
import {View} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import ReactionIcon from 'components/reactions/reaction-icon';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';

import stylesInbox from '../inbox/inbox.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
  thread: InboxThread;
}

const InboxThreadReaction = ({thread, currentUser, onNavigate}: Props) => {
  const activity: Activity = thread.messages[0].activities[0];
  const reaction: Reaction = activity.added[0] || activity.removed[0];
  const comment: ?IssueComment = activity?.comment;
  const isRemoved: boolean = !!activity?.removed[0]?.reaction;
  const isAdded: boolean = !!activity?.added[0]?.reaction;
  const reason: string = (
    isAdded
      ? comment?.reactions?.length > 0 ? i18n('added a reaction') : ''
      : isRemoved ? i18n('removed a reaction') : ''
  );

  return (
    <ThreadItem
      author={activity.author}
      avatar={
        <>
          <ReactionIcon name={reaction.reaction} size={24}/>
          {isRemoved && <View style={stylesInbox.reactionIconRemoved}/>}
        </>
      }
      change={!!comment && (
        <>
          <TouchableOpacity
            onPress={() => {
              const entity: ThreadEntity = activity?.comment?.issue || activity?.comment?.article;
              if (entity?.id) {
                onNavigate(entity, true);
              }
            }}
          >
            <StreamComment
              activity={{
                ...activity,
                added: [comment],
              }}
            />
          </TouchableOpacity>
          <ThreadCommentReactions activity={activity} currentUser={currentUser}/>
        </>
      )}
      reason={reason}
      timestamp={thread.notified}
    />
  );
};

export default React.memo(InboxThreadReaction, (prev: Props, next: Props) => {
  return prev.thread === next.thread;
});
