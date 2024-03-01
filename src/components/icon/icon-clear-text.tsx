import {TouchableOpacity} from 'react-native';
import React from 'react';

import IconPlus from 'components/icon/assets/plus.svg';
import {HIT_SLOP} from 'components/common-styles/button';

import styles from './icon-clear-text.styles';

import {ViewStyleProp} from 'types/Internal';

export function IconClearText({
  onPress,
  color = styles.icon.color,
  size = 18,
  style,
}: {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyleProp;
}) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      style={[styles.icon, style]}
      hitSlop={HIT_SLOP}
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      <IconPlus width={size} height={size} color={color} />
    </TouchableOpacity>
  );
}
