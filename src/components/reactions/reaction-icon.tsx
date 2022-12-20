import React from 'react';
import reactionsMap from './reactions';
import {DEFAULT_THEME} from '../theme/theme';
import {UNIT} from '../variables/variables';
import type {ViewStyleProp} from 'flow/Internal';
const iconDefaultSize: number = UNIT * 2;
type Props = {
  name: string;
  size?: number;
  style?: ViewStyleProp;
};

const ReactionIcon = (props: Props) => {
  const {name, size = iconDefaultSize, style} = props;
  const Icon = reactionsMap[name];
  return Icon ? (
    <Icon
      width={size}
      style={{
        fill: DEFAULT_THEME.colors.$iconAccent,
        ...style,
      }}
    />
  ) : null;
};

export default ReactionIcon;
