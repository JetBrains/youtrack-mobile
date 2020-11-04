import React from 'react';

import reactionsMap from './reactions';
import {UNIT} from '../variables/variables';
import {DEFAULT_THEME} from '../theme/theme';

const iconDefaultSize: number = UNIT * 2;

const ReactionIcon = ({name, ...rest}) => {
  const {width = iconDefaultSize, style} = rest;
  const Icon = reactionsMap[name];
  return Icon ? (
    <Icon
      {...rest}
      width={width}
      style={{fill: DEFAULT_THEME.colors.$iconAccent, ...style}}
    />
  ) : null;
};


export default ReactionIcon;
