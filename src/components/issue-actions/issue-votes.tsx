import * as React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {IconVote} from 'components/icon/icon';
import {HIT_SLOP} from 'components/common-styles';

import styles from './issue-votes.styles';

import {ViewStyleProp} from 'types/Internal';

interface Props {
  canVote: boolean;
  onVoteToggle: (voted: boolean) => any;
  size?: number;
  style?: ViewStyleProp;
  voted: boolean;
  votes: number;
}


export default function (props: Props) {
  const {voted, votes, canVote, onVoteToggle, size, style} = props;
  const toggle = () => onVoteToggle(!voted);
  const color: string = voted ? styles.link.color : canVote ? styles.iconEnabled.color : styles.iconDisabled.color;

  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      disabled={!canVote}
      style={[styles.button, style]}
      onPress={toggle}
    >
      <View style={styles.counter}><Text style={[styles.counterText, {color}]}>{votes || 0}</Text></View>
      <IconVote color={color} size={size}/>
    </TouchableOpacity>
  );
}
