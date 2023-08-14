import {TouchableOpacity} from 'react-native';
import React from 'react';

import {HIT_SLOP} from 'components/common-styles/button';
import {IconClose} from './icon';

import styles from './icon-clear-text.styles';


export function IconClearText({onPress}: { onPress: () => any }) {
  return (
    <TouchableOpacity
      style={styles.icon}
      hitSlop={HIT_SLOP}
      onPress={onPress}
    >
      <IconClose size={18} color={styles.icon.color} />
    </TouchableOpacity>
  );
}
