/* @flow */

import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch} from 'react-redux';

import InboxEntity from '../inbox/inbox__entity';
import Router from 'components/router/router';
import styles from './inbox-threads.styles';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {getThreadData} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {muteToggle, readMessageToggle} from './inbox-threads-actions';

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
  const {showActionSheetWithOptions} = useActionSheet();
  const dispatch = useDispatch();
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
      testID="test:id/inboxThreadsListThread"
      accessibilityLabel="inboxThreadsListThread"
      accessible={true}
      {...otherProps}
    >
      {!threadData.entityAtBottom && (
        <View style={hasReadActions && styles.threadTitleWrapper}>
          {renderedEntity}
          {hasReadActions && renderSettings()}
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
        execute: () => {
          updateThread({
            ..._thread,
            messages: _thread.messages.map((it: InboxThreadMessage) => {
              it.read = hasUnreadMessage;
              return it;
            }),
          });
          toggleMessagesRead(_thread.messages, hasUnreadMessage);
        },
      },
      {
        title: i18n('Cancel'),
      },
    ];

    return (
      <View style={styles.threadTitleActions}>
        <TouchableOpacity
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
            color={styles.icon.color}
          />
        </TouchableOpacity>
      </View>
    );
  }
}


export default Thread;
