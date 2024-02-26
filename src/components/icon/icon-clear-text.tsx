import {TouchableOpacity} from 'react-native';
import React from 'react';

import IconPlus from 'components/icon/assets/plus.svg';
import {HIT_SLOP} from 'components/common-styles/button';

import styles from './icon-clear-text.styles';


export function IconClearText({onPress}: { onPress: () => any }) {
  return (
    <TouchableOpacity
      style={styles.icon}
      hitSlop={HIT_SLOP}
      onPress={onPress}
    >
      <IconPlus width={18} height={18} color={styles.icon.color} />
    </TouchableOpacity>
  );
}
