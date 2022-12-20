import React from 'react';
import {TouchableOpacity} from 'react-native';
import {IconCircle, IconCircleOutline} from 'components/icon/icon';
import {useSelector} from 'react-redux';
import styles from './inbox-threads.styles';
import type {AppState} from '../../reducers';
import type {InboxThreadMessage} from 'flow/Inbox';
type Props = {
  messages: InboxThreadMessage[];
  onReadChange: (messages: InboxThreadMessage[], read: boolean) => any;
};
export default function InboxThreadReadToggleButton({
  messages = [],
  onReadChange,
}: Props) {
  const isOnline: boolean = useSelector(
    (state: AppState) => state.app.networkState?.isConnected,
  );
  return (
    <TouchableOpacity
      disabled={!isOnline}
      testID="test:id/inboxThreadsSubscriptionGroupReadToggle"
      accessibilityLabel="inboxThreadsSubscriptionGroupReadToggle"
      accessible={true}
      style={styles.threadItemAction}
      onPress={() => {
        onReadChange(messages, !messages[0].read);
      }}
    >
      {messages[0].read ? (
        <IconCircleOutline size={10} color={styles.icon.color} />
      ) : (
        <IconCircle size={10} color={styles.link.color} />
      )}
    </TouchableOpacity>
  );
}