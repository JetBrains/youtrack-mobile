/* @flow */
import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import styles from './issue-toolbar.styles';
import {View as AnimatedView} from 'react-native-animatable';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const SHOW_ANIMATION_TIME = 200;

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

export default class IssueToolbar extends PureComponent<Props, void> {
  node: ?Object;

  setNativeProps(...args: Array<any>) {
    return this.node && this.node.setNativeProps(...args);
  }

  render() {
    const {starred, voted, votes, attachesCount, canStar, canAttach, canEdit, canVote, onStarToggle, onVoteToggle, onAttach, onEdit, style} = this.props;

    return (
      <AnimatedView
        style={[styles.container, style]}
        animation="fadeInDown"
        useNativeDriver
        duration={SHOW_ANIMATION_TIME}
        ref={node => this.node = node}
      >
        {canStar && <TouchableOpacity style={styles.toolbarButton} onPress={() => onStarToggle(!starred)}>
          <View>
            <MaterialIcon name="star-outline" size={25} color={starred ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY}/>
          </View>
        </TouchableOpacity>}

        {canAttach && <TouchableOpacity style={styles.toolbarButton} onPress={onAttach}>
          <View>
            <MaterialIcon name="paperclip" size={24} color={COLOR_ICON_MEDIUM_GREY}/>
            <Text style={styles.counter}>{attachesCount}</Text>
          </View>
        </TouchableOpacity>}

        {canVote && <TouchableOpacity style={styles.toolbarButton} onPress={() => onVoteToggle(!voted)}>
          <View>
            <MaterialIcon name="thumb-up-outline" size={25} color={voted ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY}/>
            <Text style={styles.counter}>{votes}</Text>
          </View>
        </TouchableOpacity>}

        {canEdit && <TouchableOpacity style={styles.toolbarButton} onPress={onEdit}>
          <View>
            <MaterialIcon name="pencil-outline" size={25} color={COLOR_ICON_MEDIUM_GREY}/>
          </View>
        </TouchableOpacity>}
      </AnimatedView>
    );
  }
}
