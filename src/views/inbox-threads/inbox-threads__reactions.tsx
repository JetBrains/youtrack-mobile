/* @flow */

import React, {useState} from 'react';
import {View} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import ReactionIcon from 'components/reactions/reaction-icon';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadAddReactionButton from './inbox-threads__item-comment-add-reaction-button';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';
import stylesInbox from '../inbox/inbox.styles';

import type {Activity} from 'flow/Activity';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {User} from 'flow/User';

type Props = {
  currentUser: User;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
  thread: InboxThread;
}

const InboxThreadReaction = ({thread, currentUser, onNavigate}: Props) => {
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);

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

  const _activity: Activity = {
    ...activity,
    added: [comment],
  };
  return (
    <>
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
                const entity: ThreadEntity = comment?.issue || comment?.article;
                if (entity?.id) {
                  onNavigate(entity, activity.id, comment?.id);
                }
              }}
            >
              <StreamComment activity={_activity}/>
            </TouchableOpacity>
            <ThreadCommentReactions
              activity={_activity}
              currentUser={currentUser}
              isPanelVisible={isReactionPanelVisible}
            />
          </>
        )}
        reason={reason}
        timestamp={thread.notified}
      />
      <ThreadAddReactionButton
        style={styles.threadReactionsAddButton}
        onPress={() => updateReactionPanelVisible(true)}
      />
    </>
  );
};

export default React.memo(InboxThreadReaction, (prev: Props, next: Props) => {
  return prev.thread === next.thread;
});
