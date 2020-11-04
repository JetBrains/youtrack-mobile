import React, {Suspense} from 'react';

import {Text, View, TouchableOpacity} from 'react-native';

import ReactionIcon from '../reactions/reaction-icon';
import reactionNames from '../reactions/reactions-name-list';

import styles from './comment.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Reaction} from '../../flow/Reaction';
import type {User} from '../../flow/User';

type ReactionsType = {
  comment: IssueComment,
  currentUser: User,
  onReactionSelect: (comment: IssueComment, reaction: Reaction) => any
}


const CommentReactions = (props: ReactionsType) => {
  if (!props?.comment || !props.comment.reactionOrder || props.comment.reactions?.length === 0) {
    return null;
  }

  const reactionsMap = {};
  props.comment.reactions.map((reaction: Reaction) => reactionsMap[reaction.reaction] = reaction);

  return (
    <Suspense
      fallback={null}
    >
      <View style={styles.reactionsContainer}>
        {props.comment.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = props.comment.reactions.filter((it: Reaction) => it.reaction === reactionName).length;
          const reaction: Reaction = reactionsMap[reactionName];
          const isUserReacted: boolean = reaction.author.id === props.currentUser.id;

          return (
            <TouchableOpacity
              key={reaction.id}
              style={{
                ...styles.reactionsReaction,
                ...(isUserReacted ? styles.reactionsReactionSelected: null)
              }}
              onPress={() => props.onReactionSelect(props.comment, reaction)}
            >
              <ReactionIcon name={reactionName}/>
              {count > 1 && <Text style={styles.reactionsReactionCount}>{count}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </Suspense>
  );
};

export {
  CommentReactions
};
