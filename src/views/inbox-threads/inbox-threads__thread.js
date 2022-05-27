/* @flow */

import React from 'react';

import InboxEntity from '../inbox/inbox__entity';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {getThreadData} from './inbox-threads-helper';

import type {InboxThread, ThreadData, ThreadEntity} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';


export default function Thread({
  thread,
  currentUser,
  uiTheme,
}: { thread: InboxThread, currentUser: User, uiTheme: UITheme }): React$Element<any> | null {
  if (!thread.id) {
    return null;
  }

  const threadData: ThreadData = getThreadData(thread);
  const entity: ThreadEntity = threadData?.entity;
  const ThreadComponent: any = threadData.component;
  const inboxEntity = <InboxEntity
    entity={entity}
    onNavigate={() => Router.Issue({issueId: entity.id, navigateToActivity: true})}
    style={[styles.threadTitle, threadData.hideTarget && styles.threadSubTitle]}
    styleText={threadData.hideTarget && styles.threadSubTitleText}
  />;
  return entity ? (
    <>
      {!threadData.hideTarget && inboxEntity}
      <ThreadComponent
        thread={thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
      />
      {threadData.hideTarget && inboxEntity}
    </>
  ) : null;
}
