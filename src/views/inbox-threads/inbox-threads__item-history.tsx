/* @flow */

import React from 'react';

import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup, InboxThreadTarget, ThreadEntity} from 'flow/Inbox';

type Props = {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: string) => any;
}

export default function ThreadHistoryItem({group, target, onNavigate}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={<IconHistory size={20} color={styles.icon.color}/>}
      group={group}
      onNavigate={() => onNavigate(target, group.head.id)}
      reason={i18n('updated')}
      timestamp={group.head.timestamp}/>
  );
}
