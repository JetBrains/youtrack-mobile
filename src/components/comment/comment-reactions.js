import React, {Suspense} from 'react';

import {Text, View} from 'react-native';

import ReactionIcon from '../reactions/reaction-icon';
import reactionNames from '../reactions/reactions-name-list';

import styles from './comment.styles';

import type {Reaction} from '../../flow/Reaction';
import type {User} from '../../flow/User';

type ReactionsType = {
  reactions: Array<Reaction>,
  reactionOrder: string,
  currentUser: User
}


const CommentReactions = (props: ReactionsType) => {
  if (!props.reactionOrder || props.reactions?.length === 0) {
    return null;
  }

  const reactionsMap = {};
  props.reactions.map((reaction: Reaction) => reactionsMap[reaction.reaction] = reaction);

  return (
    <Suspense
      fallback={null}
    >
      <View style={styles.reactionsContainer}>
        {props.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = props.reactions.filter((it: Reaction) => it.reaction === reactionName).length;
          const reaction: Reaction = reactionsMap[reactionName];

          return (
            <View
              key={reaction.id}
              style={{
                ...styles.reactionsReaction,
                ...(reaction.author.id === props.currentUser.id ? styles.reactionsReactionSelected: null)
              }}
            >
              <ReactionIcon name={reactionName}/>
              {count > 1 && <Text style={styles.reactionsReactionCount}>{count}</Text>}
            </View>
          );
        })}
      </View>
    </Suspense>
  );
};

export {
  CommentReactions
};
