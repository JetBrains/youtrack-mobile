import React from 'react';
import {TouchableOpacity} from 'react-native';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import {HIT_SLOP} from 'components/common-styles';
import styles from './inbox-threads.styles';
import {useSelector} from 'react-redux';
import type {AppState} from '../../reducers';
type Props = {
  onPress: () => any;
  style?: any;
};
export default function ThreadAddReactionButton({onPress, style}: Props) {
  const isOnline: boolean = useSelector(
    (state: AppState) => state.app.networkState?.isConnected,
  );
  return (
    <TouchableOpacity
      style={style}
      hitSlop={HIT_SLOP}
      disabled={!isOnline}
      onPress={onPress}
    >
      <ReactionAddIcon
        color={!isOnline ? styles.disabled.color : styles.icon.color}
      />
    </TouchableOpacity>
  );
}
