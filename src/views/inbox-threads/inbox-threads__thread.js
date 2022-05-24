/* @flow */

import React from 'react';

import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadItemSubscription from './inbox-threads__subscription';

import styles from './inbox-threads.styles';

import type {InboxThread} from 'flow/Inbox';
import type {User} from 'flow/User';
import type {UITheme} from 'flow/Theme';

export default function Thread({
  thread,
  isLast,
  currentUser,
  uiTheme,
}: { thread: InboxThread, isLast: boolean, currentUser: User, uiTheme: UITheme }) {
  if (thread.id) {
    switch (thread.id[0]) {
    case 'R':
      return (
        <InboxThreadReaction
          style={[styles.thread, isLast && styles.threadLast]}
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    case 'M':
      return (
        <InboxThreadMention
          style={[styles.thread, isLast && styles.threadLast]}
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    case 'S':
      return (
        <InboxThreadItemSubscription
          style={[styles.thread, isLast && styles.threadLast]}
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    }
  }
  return null;
}
