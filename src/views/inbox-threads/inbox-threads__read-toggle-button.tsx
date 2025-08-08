import React from 'react';
import {TouchableOpacity} from 'react-native';

import {HapticFeedbackTypes, trigger} from 'react-native-haptic-feedback';

import {HIT_SLOP} from 'components/common-styles';
import {IconCircle, IconCircleOutline} from 'components/icon/icon';
import {useSelector} from 'react-redux';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';
import type {InboxThreadMessage} from 'types/Inbox';
import type {ViewStyleProp} from 'types/Internal';

type Props = {
  messages: InboxThreadMessage[];
  onReadChange: (messages: InboxThreadMessage[], read: boolean) => any;
  style?: ViewStyleProp;
};


export default function InboxThreadReadToggleButton({
  messages = [],
  onReadChange,
  style,
}: Props) {
  const isOnline: boolean = useSelector((state: AppState) => !!state.app.networkState?.isConnected);

  return (
    <TouchableOpacity
      disabled={!isOnline}
      testID="test:id/inboxThreadsSubscriptionGroupReadToggle"
      accessibilityLabel="inboxThreadsSubscriptionGroupReadToggle"
      accessible={true}
      style={[styles.threadItemAction, style]}
      onPress={() => {
        trigger(HapticFeedbackTypes.impactMedium);
        onReadChange(messages, !messages[0].read);
      }}
      hitSlop={HIT_SLOP}
    >
      {messages[0].read ? (
        <IconCircleOutline size={10} color={styles.iconAddReaction.color} />
      ) : (
        <IconCircle size={10} color={styles.link.color} />
      )}
    </TouchableOpacity>
  );
}
