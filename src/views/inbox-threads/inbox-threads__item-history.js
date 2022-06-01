/* @flow */

import React from 'react';

import Router from 'components/router/router';
import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup, InboxThreadTarget} from 'flow/Inbox';

interface Props {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
}

export default function ThreadHistoryItem({group, target}: Props) {
  return (
    <ThreadItem
      author={group.head.author}
      avatar={<IconHistory size={20} color={styles.icon.color}/>}
      group={group}
      onPress={() => Router.Issue({issueId: target.id, navigateToActivity: true})}
      reason={i18n('updated')}
      timestamp={group.head.timestamp}
    />
  );
}
