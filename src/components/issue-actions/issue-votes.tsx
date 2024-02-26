import * as React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IconVote from 'components/icon/assets/vote.svg';
import {HIT_SLOP} from 'components/common-styles';

import styles from './issue-votes.styles';

interface Props {
  voted: boolean;
  votes: number;
  canVote: boolean;
  onVoteToggle: (voted: boolean) => any;
}


export default function (props: Props) {
  const {voted, votes, canVote, onVoteToggle} = props;

  const toggle = () => onVoteToggle(!voted);

  const color: string = (
    voted
      ? styles.link.color
      : canVote ? styles.iconEnabled.color : styles.iconDisabled.color
  );
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      disabled={!canVote}
      style={styles.button}
      onPress={toggle}
    >
      <View style={styles.counter}><Text style={[styles.counterText, {color}]}>{votes || 0}</Text></View>
      <IconVote
        isActive={voted}
        width={19}
        height={19}
        color={color}
      />
    </TouchableOpacity>
  );
}
