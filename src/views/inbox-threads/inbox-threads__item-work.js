/* @flow */

import React from 'react';

import StreamWork from 'components/activity-stream/activity__stream-work';
import {i18n} from 'components/i18n/i18n';
import {IconWork} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import ThreadItem from './inbox-threads__item';

import type {InboxThreadGroup} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroup;
}


export default function ThreadWorkItem({group}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={<IconWork size={22} color={styles.icon.color} style={styles.activityWorkIcon}/>}
      change={<StreamWork activityGroup={{work: group.work}}/>}
      group={group}
      reason={i18n('updated')}
      timestamp={group.work.timestamp}
    />
  );
}
