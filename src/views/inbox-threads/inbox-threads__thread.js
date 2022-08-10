/* @flow */

import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch, useSelector} from 'react-redux';

import InboxEntity from '../inbox/inbox__entity';
import styles from './inbox-threads.styles';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {muteToggle, readMessageToggle, updateThreadsStateAndCache} from './inbox-threads-actions';

import type {AppState} from '../../reducers';
import type {InboxThread, InboxThreadMessage, ThreadData} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  onNavigate: (entity: any, navigateToActivity?: string, commentId?: string) => any,
  thread: InboxThread;
  uiTheme: UITheme;
}


function Thread({
  thread,
  currentUser,
  uiTheme,
  onNavigate,
  ...otherProps
}: Props): React$Element<any> | null {
  const {showActionSheetWithOptions} = useActionSheet();
  const isOnline: boolean = useSelector((state: AppState) => state.app.networkState?.isConnected);
  const dispatch = useDispatch();
  const [_thread, updateThread]: [InboxThread, Function] = useState(thread);

  useEffect(() => {
    updateThread(thread);
  }, [thread]);

  if (!_thread.id || !_thread?.messages?.length) {
    return null;
  }

  const doToggleMessagesRead = async (messages: InboxThreadMessage[], read: boolean, toggleThread: boolean = false) => {
    const messagesMap: { [string]: InboxThreadMessage } = messages.reduce(
      (map: { [string]: InboxThreadMessage }, it: InboxThreadMessage) => ({
        ...map,
        [it.id]: {...it, read},
      }),
      {}
    );

    const updatedThread: InboxThread = {
      ..._thread,
      messages: _thread.messages.reduce((list: InboxThreadMessage[], it: InboxThreadMessage) => {
        return list.concat(
          messagesMap[it.id] ? messagesMap[it.id] : it
        );
      }, []),
    };

    updateThread(updatedThread);
    dispatch(readMessageToggle(messages, read));
    dispatch(updateThreadsStateAndCache(updatedThread, toggleThread && read === true));
  };

  const threadData: ThreadData = getThreadData(_thread);
  const ThreadComponent: any = threadData.component;
  const renderedEntity = <InboxEntity
    testID="test:id/inboxEntity"
    accessibilityLabel="inboxEntity"
    accessible={true}
    entity={threadData.entity}
    onNavigate={() => {
      onNavigate(
        threadData.entity,
        threadData.entityAtBottom ? ((_thread.messages || [])[0].activities || [])[0]?.id : undefined
      );
    }}
    style={[styles.threadTitle, threadData.entityAtBottom && styles.threadSubTitle]}
    styleText={threadData.entityAtBottom && styles.threadSubTitleText}
  />;
  const isIssue: boolean = hasType.issue(threadData.entity);
  const hasReadActions: boolean = isIssue || hasType.article(threadData.entity);

  return (
    <View
      testID="test:id/inboxThreadsListThread"
      accessibilityLabel="inboxThreadsListThread"
      accessible={true}
      {...otherProps}
    >
      {!threadData.entityAtBottom && (
        <View style={hasReadActions && styles.threadTitleContainer}>
          <View style={styles.threadTitleContent}>
            {renderedEntity}
            {hasReadActions && renderSettings()}
          </View>
        </View>
      )}

      <ThreadComponent
        thread={_thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
        onNavigate={onNavigate}
        onReadChange={(messages: InboxThreadMessage[], read: boolean) => {
          doToggleMessagesRead(messages, read);
        }}
      />
      {threadData.entityAtBottom && <View style={styles.threadTitleContainer}>
        {renderedEntity}
      </View>}
    </View>
  );

  function renderSettings() {
    const hasUnreadMessage: boolean = _thread.messages.some(it => it.read === false);
    const options = [
      {
        title: _thread.muted ? i18n('Unmute thread') : i18n('Mute thread'),
        execute: () => {
          const isMuted: boolean = _thread.muted;
          updateThread({..._thread, muted: !isMuted});
          dispatch(muteToggle(_thread.id, !isMuted)).then((muted: boolean) => {
            if (muted !== !isMuted) {
              updateThread({..._thread, muted});
            }
          });
        },
      },
      {
        title: hasUnreadMessage ? i18n('Mark as read') : i18n('Mark as unread'),
          execute: () => doToggleMessagesRead(_thread.messages, hasUnreadMessage, true),
      },
      {
        title: i18n('Cancel'),
      },
    ];

    return (
      <View style={styles.threadTitleActions}>
        <TouchableOpacity
          disabled={!isOnline}
          testID="test:id/inboxThreadsThreadSettings"
          accessibilityLabel="inboxThreadsThreadSettings"
          accessible={true}
          onPress={() => {
            showActionSheetWithOptions(
              {
                ...defaultActionsOptions,
                options: options.map(action => action.title),
                title: `${threadData.entity?.idReadable} ${threadData.entity?.summary}`,
                cancelButtonIndex: options.length - 1,
              },
              (index: number) => options[index]?.execute && options[index].execute()
            );
          }}
          style={styles.threadTitleAction}
        >
          <IconMoreOptions
            size={18}
            color={isOnline ? styles.icon.color : styles.disabled.color}
          />
        </TouchableOpacity>
      </View>
    );
  }
}


export default Thread;
