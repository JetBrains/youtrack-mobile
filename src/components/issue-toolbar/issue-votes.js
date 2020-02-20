/* @flow */

import React, {PureComponent} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLOR_ICON_LIGHT_BLUE} from '../variables/variables';
import {HIT_SLOP} from '../../components/common-styles/button';

import styles from './issue-votes.styles';

type Props = {
  voted: boolean,
  votes: number,
  canVote: boolean,
  onVoteToggle: (voted: boolean) => any
}

export default class IssueVotes extends PureComponent<Props, void> {

  render() {
    const {voted, votes, canVote, onVoteToggle} = this.props;

    if (!canVote) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.button}
        onPress={() => onVoteToggle(!voted)}
      >
        <Text style={styles.counter}>{votes}</Text>
        <MaterialIcon
          name={voted ? 'thumb-up' : 'thumb-up-outline'}
          size={20}
          color={COLOR_ICON_LIGHT_BLUE}
        />
      </TouchableOpacity>
    );
  }
}
