/* @flow */

import {TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './issue-votes.styles';

type Props = {
  style?: any,
  starred: boolean,
  canStar: boolean,
  onStarToggle: (starred: boolean) => any
}

export default class IssueStar extends PureComponent<Props, void> {

  render() {
    const {starred, canStar, onStarToggle, style} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={[styles.container, style]}
        onPress={() => onStarToggle(!starred)}>
        <MaterialIcon
          name="star-outline"
          size={20}
          color={starred ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY}
        />
      </TouchableOpacity>
    );
  }
}
