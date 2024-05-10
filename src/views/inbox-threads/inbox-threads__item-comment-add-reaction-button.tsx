import React from 'react';
import {TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

import {HIT_SLOP} from 'components/common-styles';
import {IconAddReaction} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';

interface Props {
  onPress: () => any;
  style?: any;
}

export default function ThreadAddReactionButton({onPress, style}: Props) {
  const isOnline: boolean = useSelector(
    (state: AppState) => !!state.app.networkState?.isConnected,
  );
  return (
    <TouchableOpacity
      style={style}
      hitSlop={HIT_SLOP}
      disabled={!isOnline}
      onPress={onPress}
    >
      <IconAddReaction
        color={!isOnline ? styles.disabled.color : styles.iconAddReaction.color}
      />
    </TouchableOpacity>
  );
}
