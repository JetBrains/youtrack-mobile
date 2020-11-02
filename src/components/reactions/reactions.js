import React, {Suspense} from 'react';

import {Text, View} from 'react-native';

import ReactionIcon from './reaction-icon';

import {styles} from './reactions.style';

import type {Reaction} from '../../flow/Reaction';

type ReactionsType = {
  reactions: Array<Reaction>,
  reactionOrder: string
}

const availableReactionNames: Array<string> = [
  'yes',
  'thanks',
  'thumbs-up',
  'thumbs-down',
  'strong',
  'clapping',
  'ok',
  'congratulations',
  'glad',
  'worry',
  'grimacing',
  'grinning',
  'joy',
  'tongue-out',
  'saint',
  'cool',
  'surprised',
  'sleepy',
  'relieved',
  'scared',
  'sick',
  'tired',
  'tears',
  'wink',
  'nerd',
  'crossed-fingers',
  'waiting',
  'thank-you',
  'fist',
  'raised-hand',
  'wave',
  'rock',
  'mind-blown',
  'cat-in-love',
  'scared-cat',
  'rocket',
  'teddybear',
  'red-heart',
  'no',
  'question',
  '100',
  'eyes',
  'plus-one',
  'minus-one',
  'comment',
  'okay',
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
];


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
          if (!availableReactionNames.includes(reactionName)) {
            return null;
          }

          const count: number = props.reactions.filter((it: Reaction) => it.reaction === reactionName).length;
          return (
            <View
              key={reactionsMap[reactionName].id}
              style={styles.reaction}
            >
              <ReactionIcon name={reactionName} height={16}/>
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
