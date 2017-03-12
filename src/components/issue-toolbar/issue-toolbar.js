/* @flow */
import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {PureComponent} from 'react';
import {star, starInactive, pencil, vote, voteInactive, attachInactive} from '../icon/icon';
import styles from './issue-toolbar.styles';

type Props = {
  style?: any,
  starred: boolean,
  voted: boolean,
  votes: number,
  attachesCount: number,

  canEdit: boolean,
  canStar: boolean,
  canAttach: boolean,
  canVote: boolean,

  onStarToggle: (starred: boolean) => any,
  onVoteToggle: (voted: boolean) => any,
  onEdit: (any) => any,
  onAttach: (any) => any
}

export default class IssueToolbar extends PureComponent<void, Props, void> {
  render() {
    const {starred, voted, votes, attachesCount, canStar, canAttach, canEdit, canVote, onStarToggle, onVoteToggle, onAttach, onEdit, style} = this.props;

    return (
      <View style={[styles.container, style]}>
        {canStar && <TouchableOpacity style={styles.toolbarButton} onPress={() => onStarToggle(!starred)}>
          <View>
            <Image source={starred ? star : starInactive} style={styles.toolbarIcon}/>
          </View>
        </TouchableOpacity>}

        {canAttach && <TouchableOpacity style={styles.toolbarButton} onPress={onAttach}>
          <View>
            <Image source={attachInactive} style={styles.toolbarIcon}/>
            <Text style={styles.counter}>{attachesCount}</Text>
          </View>
        </TouchableOpacity>}

        {canVote && <TouchableOpacity style={styles.toolbarButton} onPress={() => onVoteToggle(!voted)}>
          <View>
            <Image source={voted ? vote : voteInactive} style={styles.toolbarIcon}/>
            <Text style={styles.counter}>{votes}</Text>
          </View>
        </TouchableOpacity>}

        {canEdit && <TouchableOpacity style={styles.toolbarButton} onPress={onEdit}>
          <View>
            <Image source={pencil} style={styles.toolbarIcon}/>
          </View>
        </TouchableOpacity>}
      </View>
    );
  }
}
