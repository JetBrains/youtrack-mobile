/* @flow */

import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import InboxEntity from '../inbox/inbox__entity';
import IconBellCrossed from 'components/icon/assets/bell-crossed.svg';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {muteToggle} from './inbox-threads-actions';

import type {AppState} from '../../reducers';
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
  const dispatch = useDispatch();
  const isOnline = useSelector((state: AppState) => state.app.networkState?.isConnected === true);
  const [isMuted, updateMuted] = useState(thread.muted);

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
  const isIssue: boolean = hasType.issue(threadData.entity);

  return (
    <View
      testID="test:id/inboxThreadsThread"
      accessibilityLabel="inboxThreadsThread"
      accessible={true}
      {...otherProps}
    >
      {!threadData.entityAtBottom && (
        <View style={isIssue && styles.threadTitleWrapper}>
          {renderedEntity}
          {isIssue && (
            <TouchableOpacity
              testID="test:id/inboxThreadsThreadMuteToggle"
              accessibilityLabel="inboxThreadsThreadMuteToggle"
              accessible={true}
              disabled={!isOnline}
              onPress={() => {
                updateMuted(!isMuted);
                dispatch(muteToggle(thread.id, !isMuted)).then((muted: boolean) => {
                  updateMuted(muted);
                });
              }}
              style={styles.threadMuteToggle}
            >
              <IconBellCrossed
                fill={(
                  isOnline
                    ? (isMuted ? styles.link.color : styles.icon.color)
                    : (isMuted ? styles.threadButtonText.color : styles.container.backgroundColor)
                )}
                width={17}
                height={17}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

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
