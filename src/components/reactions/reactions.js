import React, {Suspense} from 'react';

import {Text, View} from 'react-native';

import ReactionIcon from './reaction-icon';
import reactionNames from './reactions-name-list';

import {styles} from './reactions.style';

import type {Reaction} from '../../flow/Reaction';

type ReactionsType = {
  reactions: Array<Reaction>,
  reactionOrder: string
}


const Reactions = (props: ReactionsType) => {
  if (!props.reactionOrder || props.reactions?.length === 0) {
    return null;
  }

  const reactionsMap = {};
  props.reactions.map((reaction: Reaction) => reactionsMap[reaction.reaction] = reaction);

  return (
    <Suspense
      fallback={null}
    >
      <View style={styles.container}>
        {props.reactionOrder.split('|').map((reactionName: string) => {
          if (!reactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = props.reactions.filter((it: Reaction) => it.reaction === reactionName).length;
          return (
            <View
              key={reactionsMap[reactionName].id}
              style={styles.reaction}
            >
              <ReactionIcon name={reactionName}/>
              {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
            </View>
          );
        })}
      </View>
    </Suspense>
  );
};

export {
  Reactions
};
