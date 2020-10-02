/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconStar, IconStarOutline} from '../icon/icon';
import {HIT_SLOP} from '../common-styles/button';
import type {UITheme} from '../../flow/Theme';

type Props = {
  style?: any,
  starred: boolean,
  canStar: boolean,
  onStarToggle: (starred: boolean) => any,
  uiTheme: UITheme
}

export default class IssueStar extends PureComponent<Props, void> {

  toggle = () => {
    const {starred, onStarToggle} = this.props;
    onStarToggle(!starred);
  }

  render() {
    const {starred, canStar, style, uiTheme} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={style}
        onPress={this.toggle}>
        {starred ? <IconStar size={22} color={uiTheme.colors.$link}/> : <IconStarOutline size={22} color={uiTheme.colors.$navigation}/>}
      </TouchableOpacity>
    );
  }
}
