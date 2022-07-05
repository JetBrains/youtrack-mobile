/* @flow */

import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import InboxEntity from '../inbox/inbox__entity';
import InboxThreadReadToggleButton from './inbox-threads__read-toggle-button';
import IconBellCrossed from 'components/icon/assets/bell-crossed.svg';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {muteToggle, readMessageToggle} from './inbox-threads-actions';

import type {AppState} from '../../reducers';
import type {InboxThread, InboxThreadMessage, ThreadData} from 'flow/Inbox';
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
  const [_thread, updateThread] = useState(thread);

  if (!_thread.id || !_thread?.messages?.length) {
    return null;
  }

  const toggleMessagesRead = (messages: InboxThreadMessage[] = [], read: boolean): void => {
    dispatch(readMessageToggle(messages, read));
  };
  const threadData: ThreadData = getThreadData(_thread);
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
  const hasReadActions: boolean = isIssue || hasType.article(threadData.entity);

  return (
    <View
      testID="test:id/inboxThreadsThread"
      accessibilityLabel="inboxThreadsThread"
      accessible={true}
      {...otherProps}
    >
      {!threadData.entityAtBottom && (
        <View style={hasReadActions && styles.threadTitleWrapper}>
          {renderedEntity}
          {hasReadActions && (
            <View style={styles.threadTitleActions}>
              <InboxThreadReadToggleButton
                testID="test:id/inboxThreadsThreadReadToggle"
                accessibilityLabel="inboxThreadsThreadReadToggle"
                accessible={true}
                messages={_thread.messages}
                style={styles.threadTitleAction}
                onReadChange={(messages: InboxThreadMessage[], isRead: boolean) => {
                  updateThread({
                    ..._thread,
                    messages: messages.map((it: InboxThreadMessage) => {
                      it.read = isRead;
                      return it;
                    }),
                  });
                  toggleMessagesRead(_thread.messages, isRead);
                }}
              />

              {isIssue && <TouchableOpacity
                testID="test:id/inboxThreadsThreadMuteToggle"
                accessibilityLabel="inboxThreadsThreadMuteToggle"
                accessible={true}
                disabled={!isOnline}
                onPress={() => {
                  const isMuted: boolean = _thread.muted;
                  updateThread({..._thread, muted: !isMuted});
                  dispatch(muteToggle(_thread.id, !isMuted)).then((muted: boolean) => {
                    if (muted !== !isMuted) {
                      updateThread({..._thread, muted});
                    }
                  });
                }}
                style={[styles.threadTitleAction, styles.threadMuteToggle]}
              >
                <IconBellCrossed
                  fill={(
                    isOnline
                      ? (_thread.muted ? styles.link.color : styles.icon.color)
                      : (_thread.muted ? styles.threadButtonText.color : styles.container.backgroundColor)
                  )}
                  width={17}
                  height={17}
                />
              </TouchableOpacity>}
            </View>
          )}
        </View>
      )}

      <ThreadComponent
        thread={_thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
        onPress={onPress}
        onReadChange={(messages: InboxThreadMessage[], read: boolean) => toggleMessagesRead(messages, read)}
      />
      {threadData.entityAtBottom && renderedEntity}
    </View>
  );
}

export default Thread;
