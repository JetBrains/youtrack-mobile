/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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
        style={style}
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
