import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';
import CommentReactions from 'components/comment/comment-reactions';
import ReactionsPanel from '../issue/activity/issue__activity-reactions-dialog';
import {COMMENT_REACTIONS_SEPARATOR} from 'components/reactions/reactions';
import {onReactionSelect} from './inbox-threads-actions';
import styles from './inbox-threads.styles';
import type {User} from 'types/User';
import type {Reaction} from 'types/Reaction';
import type {Activity} from 'types/Activity';
import type {IssueComment} from 'types/CustomFields';
import type {ThreadEntity} from 'types/Inbox';
type Props = {
  activity: Activity;
  currentUser: User;
  isPanelVisible: boolean;
};

const ThreadCommentReactions = ({
  activity,
  currentUser,
  isPanelVisible,
}: Props) => {
  const dispatch = useDispatch();
  const [comment, updateComment] = useState(activity.comment);
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);
  useEffect(() => {
    if (typeof isPanelVisible === 'boolean') {
      updateReactionPanelVisible(isPanelVisible);
    }
  }, [isPanelVisible]);

  const onSelect = (reaction: Reaction) => {
    const entity: ThreadEntity | null | undefined =
      comment?.issue || comment?.article;

    if (!entity?.id) {
      return;
    }

    dispatch(
      onReactionSelect(
        entity,
        comment,
        reaction,
        (added: Reaction, isRemoved: boolean) => {
          const reactionName: string = reaction.reaction;
          const commentReactions: Reaction[] = comment.reactions || [];
          const otherUserHasSameReaction: boolean = commentReactions.some(
            (it: Reaction) =>
              it.reaction === reactionName && it.author.id !== currentUser?.id,
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
              reactions: commentReactions.filter(
                (it: Reaction) => !(it.id === reaction.id),
              ),
              reactionOrder,
            };
          } else {
            updatedComment = {
              ...comment,
              reactions: commentReactions.concat(added),
              reactionOrder: otherUserHasSameReaction
                ? reactionOrder
                : `${reactionOrder}|${reactionName}`,
            };
          }

          updateComment(updatedComment);
        },
      ),
    );
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
      {isReactionPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            onSelect(reaction);
            updateReactionPanelVisible(false);
          }}
          onHide={updateReactionPanelVisible}
        />
      )}
    </View>
  );
};

export default React.memo(ThreadCommentReactions);
