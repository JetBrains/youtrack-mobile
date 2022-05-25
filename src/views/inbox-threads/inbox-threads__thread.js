/* @flow */

import React from 'react';

import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadItemSubscription from './inbox-threads__subscription';

import type {InboxThread} from 'flow/Inbox';
import type {User} from 'flow/User';
import type {UITheme} from 'flow/Theme';

export default function Thread({
  thread,
  currentUser,
  uiTheme,
}: { thread: InboxThread, currentUser: User, uiTheme: UITheme }): React$Element<any> | null {
  if (thread.id) {
    switch (thread.id[0]) {
    case 'R':
      return (
        <InboxThreadReaction
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    case 'M':
      return (
        <InboxThreadMention
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    case 'S':
      return (
        <InboxThreadItemSubscription
          thread={thread}
          currentUser={currentUser}
          uiTheme={uiTheme}
        />
      );
    }
  }
  return null;
}
