import getEventTitle from '../activity/activity__history-title';
import {COMMENT_REACTIONS_SEPARATOR} from '../reactions/reactions';
import type {Activity} from 'flow/Activity';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {User} from 'flow/User';

const firstActivityChange = (
  activity: Activity | null | undefined,
): any | null => {
  if (!activity || !activity.added) {
    return null;
  }

  if (Array.isArray(activity.added)) {
    return activity.added[0];
  }

  return activity.added;
};

const getActivityEventTitle = (activity: Activity): string => {
  return `${getEventTitle(activity) || ''} `;
};

const getDurationPresentation = (duration: {presentation: string}): string =>
  duration?.presentation || '';

function updateActivityCommentReactions({
  comment,
  currentUser,
  reaction,
}: {
  comment: IssueComment;
  currentUser: User;
  reaction: Reaction;
}) {
  const _comment: IssueComment = {...comment};
  _comment.reactions = _comment?.reactions || [];
  _comment.reactionOrder = _comment.reactionOrder || '';

  const existedCommentReaction:
    | Reaction
    | null
    | undefined = _comment.reactions.find(
    (it: Reaction) =>
      it.reaction === reaction.reaction && it?.author?.id === currentUser?.id,
  );

  if (existedCommentReaction) {
    _comment.reactions = _comment.reactions.filter(
      (it: Reaction) =>
        it?.id !== existedCommentReaction.id &&
        existedCommentReaction.author.id === currentUser.id,
    );

    const anotherUserHasReaction: boolean = _comment.reactions.some(
      (it: Reaction) => it.reaction === reaction.reaction,
    );

    if (!anotherUserHasReaction) {
      _comment.reactionOrder = _comment.reactionOrder
        .split(COMMENT_REACTIONS_SEPARATOR)
        .filter((name: string) => name !== reaction.reaction)
        .join(COMMENT_REACTIONS_SEPARATOR);
    }
  } else {
    _comment.reactions = _comment.reactions.concat(reaction);

    const containsReaction: boolean = _comment.reactionOrder
      .split(COMMENT_REACTIONS_SEPARATOR)
      .some((reactionName: string) => reactionName === reaction.reaction);

    if (!containsReaction) {
      _comment.reactionOrder = [_comment.reactionOrder, reaction.reaction]
        .filter(Boolean)
        .join('|');
    }
  }

  return _comment;
}

export {
  firstActivityChange,
  getActivityEventTitle,
  getDurationPresentation,
  updateActivityCommentReactions,
};