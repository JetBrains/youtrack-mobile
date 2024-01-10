import React from 'react';

import StreamWork from 'components/activity-stream/activity__stream-work';
import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';
import {IconWork} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {
  InboxThreadGroup,
  InboxThreadTarget,
} from 'types/Inbox';
import {Entity} from 'types/Entity';

type Props = {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onNavigate: (entity: Entity, navigateToActivity?: boolean) => any;
};


export default function ThreadWorkItem({group, target, onNavigate}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={
        <IconWork
          size={22}
          color={styles.icon.color}
          style={styles.activityWorkIcon}
        />
      }
      change={
        <StreamWork
          activityGroup={{
            work: group.work,
          }}
        />
      }
      group={group}
      onNavigate={() => onNavigate(target, group.work.id)}
      reason={i18n('updated')}
      timestamp={group.work.timestamp}
    />
  );
}
