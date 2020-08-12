/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconStar, IconStarOutline} from '../icon/icon';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';

type Props = {
  style?: any,
  starred: boolean,
  canStar: boolean,
  onStarToggle: (starred: boolean) => any
}

export default class IssueStar extends PureComponent<Props, void> {

  toggle = () => {
    const {starred, onStarToggle} = this.props;
    onStarToggle(!starred);
  }

  render() {
    const {starred, canStar, style} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={style}
        onPress={this.toggle}>
        {starred ? <IconStar size={22} color={COLOR_PINK}/> : <IconStarOutline size={22} color={COLOR_ICON_MEDIUM_GREY}/>}
      </TouchableOpacity>
    );
  }
}
