/* @flow */

import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import CommentReactions from 'components/comment/comment-reactions';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import ReactionsPanel from '../issue/activity/issue__activity-reactions-dialog';
import {COMMENT_REACTIONS_SEPARATOR} from 'components/reactions/reactions';
import {HIT_SLOP} from 'components/common-styles/button';
import {onReactionSelect} from './inbox-threads-actions';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {User} from 'flow/User';
import type {Reaction} from 'flow/Reaction';
import type {Activity} from 'flow/Activity';
import type {IssueComment} from 'flow/CustomFields';
import type {ThreadEntity} from 'flow/Inbox';

interface Props {
  activity: Activity;
  currentUser: User;
}

const ThreadCommentReactions = ({activity, currentUser}: Props) => {
  const dispatch = useDispatch();
  const isOnline: boolean = useSelector((state: AppState) => state.app.networkState?.isConnected);
  const [comment, updateComment] = useState(activity.comment);
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);

  const onSelect = (reaction: Reaction) => {
    const entity: ?ThreadEntity = comment?.issue || comment?.article;
    if (!entity?.id) {
      return;
    }
    dispatch(onReactionSelect(
      entity,
      comment,
      reaction,
      (added: Reaction, isRemoved: boolean) => {
        const reactionName: string = reaction.reaction;
        const commentReactions: Reaction[] = comment.reactions || [];
        const otherUserHasSameReaction: boolean = commentReactions.some(
          (it: Reaction) => it.reaction === reactionName && it.author.id !== currentUser?.id
        );
        let reactionOrder: string = comment.reactionOrder || '';
        let updatedComment;
        if (isRemoved) {
          if (!otherUserHasSameReaction) {
            reactionOrder = reactionOrder
              .split(COMMENT_REACTIONS_SEPARATOR)
              .filter((name: string) => name !== reactionName)
              .join(COMMENT_REACTIONS_SEPARATOR);
          }
          updatedComment = {
            ...comment,
            reactions: commentReactions.filter((it: Reaction) => !(it.id === reaction.id)),
            reactionOrder,
          };
        } else {
          updatedComment = {
            ...comment,
            reactions: commentReactions.concat(added),
            reactionOrder: otherUserHasSameReaction ? reactionOrder : `${reactionOrder}|${reactionName}`,
          };
        }
        updateComment(updatedComment);
      }
    ));
  };

  return (
    <View style={styles.threadReactions}>
      <CommentReactions
        style={styles.threadReactionsList}
        comment={comment}
        currentUser={currentUser}
        onReactionSelect={(targetComment: IssueComment, reaction: Reaction) => {
          onSelect(reaction);
        }}
      />
      <TouchableOpacity
        style={styles.threadReactionsAddIcon}
        hitSlop={HIT_SLOP}
        disabled={!isOnline}
        onPress={() => updateReactionPanelVisible(true)}
      >
        <ReactionAddIcon color={isOnline ? styles.icon.color : styles.disabled.color}/>
      </TouchableOpacity>
      {isReactionPanelVisible && <ReactionsPanel
        onSelect={(reaction: Reaction) => {
          onSelect(reaction);
          updateReactionPanelVisible(false);
        }}
        onHide={updateReactionPanelVisible}
      />}
    </View>
  );
};

export default React.memo(ThreadCommentReactions);
