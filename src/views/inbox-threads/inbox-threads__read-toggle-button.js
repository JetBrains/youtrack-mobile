/* @flow */

import React from 'react';
import {TouchableOpacity} from 'react-native';

import {IconCircle, IconCircleOutline} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadMessage} from 'flow/Inbox';


interface Props {
  messages: InboxThreadMessage[];
  onReadChange: (messages: InboxThreadMessage[], read: boolean) => any;
}

export default function InboxThreadReadToggleButton({messages = [], onReadChange}: Props) {

  return (
    <TouchableOpacity
      testID="test:id/inboxThreadsSubscriptionGroupReadToggle"
      accessibilityLabel="inboxThreadsSubscriptionGroupReadToggle"
      accessible={true}
      style={styles.threadItemAction}
      onPress={() => {
        onReadChange(messages, !messages[0].read);
      }}
    >
      {(messages[0].read
        ? <IconCircleOutline
          size={10}
          color={styles.link.color}
        />
        : <IconCircle
          size={10}
          color={styles.link.color}
        />)}
    </TouchableOpacity>
  );
}

