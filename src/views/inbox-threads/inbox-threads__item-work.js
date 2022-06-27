/* @flow */

import React from 'react';

import Router from 'components/router/router';
import StreamWork from 'components/activity-stream/activity__stream-work';
import {i18n} from 'components/i18n/i18n';
import {IconWork} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import ThreadItem from './inbox-threads__item';

import type {InboxThreadGroup, InboxThreadTarget, ThreadEntity} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  onPress?: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
}


export default function ThreadWorkItem({group, target, onPress}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={<IconWork size={22} color={styles.icon.color} style={styles.activityWorkIcon}/>}
      change={<StreamWork activityGroup={{work: group.work}}/>}
      group={group}
      onPress={() => {
        if (onPress) {
          onPress(target, true);
        } else {
          Router.Issue({issueId: target.id, navigateToActivity: true});
        }
      }}
      reason={i18n('updated')}
      timestamp={group.work.timestamp}
    />
  );
}
