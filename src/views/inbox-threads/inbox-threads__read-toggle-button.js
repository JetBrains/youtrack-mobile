/* @flow */

import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';

import {IconCircle, IconCircleOutline} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadMessage} from 'flow/Inbox';


interface Props {
  messages: InboxThreadMessage[];
  onReadChange: (messages: InboxThreadMessage[], read: boolean) => any;
}

export default function InboxThreadReadToggleButton({messages = [], onReadChange, ...otherProps}: Props) {
  const [hasUnread, updateHasUnread] = useState(messages.some(it => it.read === false));

  return (
    <TouchableOpacity
      {...otherProps}
      onPress={async () => {
        onReadChange(messages, hasUnread);
        updateHasUnread(!hasUnread);
      }}
    >
      {(hasUnread
        ? <IconCircle
          size={10}
          color={styles.link.color}
        />
        : <IconCircleOutline
          size={10}
          color={styles.link.color}
        />)}
    </TouchableOpacity>
  );
}

