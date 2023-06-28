import * as React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {HIT_SLOP} from 'components/common-styles';
import {IconThumbUp} from 'components/icon/icon';

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
      <Text style={[styles.counter, {color}]}>{votes || 0}</Text>
      <IconThumbUp
        isActive={voted}
        size={19}
        color={color}
      />
    </TouchableOpacity>
  );
}
