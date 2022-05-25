/* @flow */

import React from 'react';

import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroup;
}

export default function ThreadHistoryItem({group}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={<IconHistory size={20} color={styles.icon.color}/>}
      group={group}
      reason={i18n('updated')}
      timestamp={group.head.timestamp}
    />
  );
}
