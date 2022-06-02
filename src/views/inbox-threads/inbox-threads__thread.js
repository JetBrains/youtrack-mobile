/* @flow */

import React from 'react';
import {View} from 'react-native';

import InboxEntity from '../inbox/inbox__entity';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';

import type {InboxThread, ThreadData, ThreadEntity} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';

type Props = { thread: InboxThread, currentUser: User, uiTheme: UITheme, ... };


function Thread({
  thread,
  currentUser,
  uiTheme,
  ...otherProps
}: Props): React$Element<any> | null {
  if (!thread.id || !thread?.messages?.length) {
    return null;
  }

  const threadData: ThreadData = getThreadData(thread);
  const entity: ThreadEntity = threadData.entity;
  const ThreadComponent: any = threadData.component;
  const inboxEntity = <InboxEntity
    testID="test:id/inboxEntity"
    accessibilityLabel="inboxEntity"
    accessible={true}
    entity={entity}
    onNavigate={() => {
      if (hasType.article(entity)) {
        Router.Article({articlePlaceholder: entity});
      } else {
        Router.Issue({issueId: entity.id});
      }
    }}
    style={[styles.threadTitle, threadData.entityAtBottom && styles.threadSubTitle]}
    styleText={threadData.entityAtBottom && styles.threadSubTitleText}
  />;
  return (
    <View
      testID="test:id/inboxThreadsThread"
      accessibilityLabel="inboxThreadsThread"
      accessible={true}
      {...otherProps}
    >
      {!threadData.entityAtBottom && inboxEntity}
      <ThreadComponent
        thread={thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
      />
      {threadData.entityAtBottom && inboxEntity}
    </View>
  );
}

export default (React.memo<Props>(
  Thread,
  (prev: Props, next: Props) => prev?.thread?.notified === next?.thread?.notified
): React$AbstractComponent<Props, mixed>);
