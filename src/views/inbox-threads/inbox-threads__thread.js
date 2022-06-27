/* @flow */

import React from 'react';
import {View} from 'react-native';

import InboxEntity from '../inbox/inbox__entity';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';

import type {InboxThread, ThreadData} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  onPress: (entity: any, navigateToActivity?: boolean) => any,
  thread: InboxThread;
  uiTheme: UITheme;
}


function Thread({
  thread,
  currentUser,
  uiTheme,
  onPress,
  ...otherProps
}: Props): React$Element<any> | null {
  if (!thread.id || !thread?.messages?.length) {
    return null;
  }

  const threadData: ThreadData = getThreadData(thread);
  const ThreadComponent: any = threadData.component;
  const renderedEntity = <InboxEntity
    testID="test:id/inboxEntity"
    accessibilityLabel="inboxEntity"
    accessible={true}
    entity={threadData.entity}
    onNavigate={() => {
      if (onPress) {
        onPress(threadData.entity, threadData.entityAtBottom);
      } else {
        if (hasType.article(threadData.entity)) {
          Router.Article({articlePlaceholder: threadData.entity, navigateToActivity: threadData.entityAtBottom});
        } else {
          Router.Issue({issueId: threadData.entity.id, navigateToActivity: threadData.entityAtBottom});
        }
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
      {!threadData.entityAtBottom && renderedEntity}
      <ThreadComponent
        thread={thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
        onPress={onPress}
      />
      {threadData.entityAtBottom && renderedEntity}
    </View>
  );
}

export default (React.memo<Props>(
  Thread,
  (prev: Props, next: Props) => prev?.thread?.notified === next?.thread?.notified
): React$AbstractComponent<Props, mixed>);
