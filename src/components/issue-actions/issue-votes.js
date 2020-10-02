/* @flow */

import React, {PureComponent} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {IconThumbUp} from '../icon/icon';
import {UNIT} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';
import {secondaryText} from '../common-styles/typography';

import type {UITheme} from '../../flow/Theme';

type Props = {
  voted: boolean,
  votes: number,
  canVote: boolean,
  onVoteToggle: (voted: boolean) => any,
  uiTheme: UITheme
}

export default class IssueVotes extends PureComponent<Props, void> {

  toggle = () => {
    const {voted, onVoteToggle} = this.props;
    onVoteToggle(!voted);
  }

  render() {
    const {voted, votes, canVote, uiTheme} = this.props;

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
          color={uiTheme.colors.$iconAccent}
        />
      </TouchableOpacity>
    );
  }
}

const styles = EStyleSheet.create({
  button: {
    marginLeft: UNIT * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  counter: {
    marginRight: UNIT,
    ...secondaryText,
    color: '$icon'
  }
});
