/* @flow */

import React, {PureComponent} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {COLOR_ICON_MEDIUM_GREY} from '../variables/variables';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from './issue-votes.styles';

type Props = {
  style?: any,
  canAttach: boolean,
  onAttach: (any) => any
}

export default class IssueAttach extends PureComponent<Props, void> {

  render() {
    const {canAttach, onAttach, style} = this.props;

    if (!canAttach) {
      return null;
    }
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onAttach}>
        <View>
          <MaterialIcon
            name="paperclip"
            size={24}
            color={COLOR_ICON_MEDIUM_GREY}
          />
        </View>
      </TouchableOpacity>
    );
  }
}
