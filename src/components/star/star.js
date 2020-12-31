/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconStar, IconStarOutline} from '../icon/icon';
import {HIT_SLOP} from '../common-styles/button';
import type {UITheme} from '../../flow/Theme';

type Props = {
  canStar: boolean,
  hasStar: boolean,
  onStarToggle: (starred: boolean) => any,
  style?: any,
  uiTheme: UITheme
}

export default class Star extends PureComponent<Props, void> {

  toggle = () => {
    const {hasStar, onStarToggle} = this.props;
    onStarToggle(!hasStar);
  }

  render() {
    const {hasStar, canStar, style, uiTheme} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={style}
        onPress={this.toggle}>
        {hasStar ? <IconStar size={22} color={uiTheme.colors.$link}/> : <IconStarOutline size={22} color={uiTheme.colors.$navigation}/>}
      </TouchableOpacity>
    );
  }
}
