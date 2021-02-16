/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconStar, IconStarOutline} from '../icon/icon';
import {HIT_SLOP} from '../common-styles/button';
import type {UITheme} from '../../flow/Theme';

type Props = {
  disabled?: boolean,
  canStar: boolean,
  hasStar: boolean,
  onStarToggle: (starred: boolean) => any,
  style?: any,
  size?: number,
  uiTheme: UITheme
}

export default class Star extends PureComponent<Props, void> {

  toggle = () => {
    const {hasStar, onStarToggle} = this.props;
    onStarToggle(!hasStar);
  };

  render() {
    const {hasStar, canStar, style, uiTheme, size = 22, disabled = false} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        disabled={disabled}
        hitSlop={HIT_SLOP}
        style={style}
        onPress={this.toggle}>
        {hasStar
          ? <IconStar size={size} color={uiTheme.colors.$link}/>
          : <IconStarOutline size={size} color={uiTheme.colors.$navigation}/>
        }
      </TouchableOpacity>
    );
  }
}
