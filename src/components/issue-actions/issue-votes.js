/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

import {IconThumbUp} from '../icon/icon';
import {COLOR_ICON_LIGHT_BLUE, UNIT} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';

import {secondaryText} from '../common-styles/typography';

type Props = {
  voted: boolean,
  votes: number,
  canVote: boolean,
  onVoteToggle: (voted: boolean) => any
}

export default class IssueVotes extends PureComponent<Props, void> {

  toggle = () => {
    const {voted, onVoteToggle} = this.props;
    onVoteToggle(!voted);
  }

  render() {
    const {voted, votes, canVote} = this.props;

    if (!canVote) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.button}
        onPress={this.toggle}
      >
        <Text style={styles.counter}>{votes || 0}</Text>
        <IconThumbUp
          isActive={voted}
          size={20}
          color={COLOR_ICON_LIGHT_BLUE}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginLeft: UNIT * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  counter: {
    marginRight: UNIT,
    ...secondaryText
  }
});
