import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch, useSelector} from 'react-redux';

import animation from 'components/animation/animation';
import InboxEntity from '../inbox/inbox__entity';
import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadReadToggleButton from 'views/inbox-threads/inbox-threads__read-toggle-button';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {getStorageState} from 'components/storage/storage';
import {getThreadTypeData, ThreadTypeData} from 'views/inbox-threads/inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {
  muteToggle,
  readMessageToggle,
  updateThreadsStateAndCache,
} from './inbox-threads-actions';
import {SwipeableRowWithHint} from 'components/swipeable/swipeable';
import {swipeDirection} from 'components/swipeable';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';
import type {InboxThread, InboxThreadMessage, ThreadData} from 'types/Inbox';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';

type Props = {
  currentUser: User;
  onNavigate: (
    entity: any,
    navigateToActivity?: string,
    commentId?: string,
  ) => any;
  thread: InboxThread;
  uiTheme: UITheme;
  showSwipeHint: boolean;
  style?: ViewStyleProp[] | ViewStyleProp,
  onAfterHintShow: () => void,
};

function Thread({
  thread,
  currentUser,
  uiTheme,
  onNavigate,
  showSwipeHint,
  style,
  onAfterHintShow,
}: Props) {
  const isMergedNotifications: React.MutableRefObject<boolean> = React.useRef(!!getStorageState().mergedNotifications);
  const isSwipeEnabled: React.MutableRefObject<boolean> = React.useRef(!!getStorageState().notificationsSwipe);
  const {showActionSheetWithOptions} = useActionSheet();
  const isOnline: boolean = useSelector((state: AppState) => !!state.app.networkState?.isConnected);

  const dispatch: ReduxThunkDispatch = useDispatch();

  const [_thread, updateThread] = useState(thread);

  useEffect(() => {
    updateThread(thread);
  }, [thread]);

  if (!_thread.id || !_thread?.messages?.length) {
    return null;
  }

  const doToggleMessagesRead = (
    messages: InboxThreadMessage[],
    read: boolean,
    toggleThread: boolean = false,
  ) => {
    const messagesMap: Record<string, InboxThreadMessage> = messages.reduce(
      (map: Record<string, InboxThreadMessage>, it: InboxThreadMessage) => ({
        ...map,
        [it.id]: {...it, read},
      }),
      {},
    );
    const updatedThread: InboxThread = {
      ..._thread,
      messages: _thread.messages.reduce(
        (list: InboxThreadMessage[], it: InboxThreadMessage) => list.concat(
          messagesMap[it.id] ? messagesMap[it.id] : it
        ),
        [],
      ),
    };
    updateThread(updatedThread);
    dispatch(readMessageToggle(messages, read));
    dispatch(
      updateThreadsStateAndCache(updatedThread, toggleThread && read === true),
    );
    animation.layoutAnimation();
  };

  const threadData: ThreadData = createThreadData(_thread, isMergedNotifications.current);
  const ThreadComponent: any = threadData.component;
  const renderedEntity = (
    <InboxEntity
      testID="test:id/inboxEntity"
      accessibilityLabel="inboxEntity"
      accessible={true}
      entity={threadData.entity}
      onNavigate={() => onNavigate(threadData.entity)}
      style={[
        styles.threadTitle,
        threadData.entityAtBottom && styles.threadSubTitle,
      ]}
      styleText={threadData.entityAtBottom && styles.threadSubTitleText}
    />
  );
  const hasSettings: boolean = hasType.issue(threadData.entity) || hasType.article(threadData.entity);
  const hasMarkReadField: boolean = typeof _thread.messages?.[0]?.read === 'boolean';
  const renderedComponent = (
    <>
      <ThreadComponent
        thread={_thread}
        currentUser={currentUser}
        uiTheme={uiTheme}
        onNavigate={onNavigate}
        onReadChange={(messages: InboxThreadMessage[], read: boolean) => {
          doToggleMessagesRead(messages, read);
        }}
      />
      {threadData.entityAtBottom && (
        <View style={styles.threadTitleContainer}>{renderedEntity}</View>
      )}
    </>
  );

  const hasUnreadMessage = _thread.messages.some(it => it.read === false);
  return (
    <View
      testID="test:id/inboxThreadsListThread"
      accessibilityLabel="inboxThreadsListThread"
      accessible={true}
      style={style}
    >
      {!threadData.entityAtBottom && (
        <View style={hasSettings && styles.threadTitleContainer}>
          <View style={styles.threadTitleContent}>
            {renderedEntity}
            {hasSettings && renderSettings()}
          </View>
        </View>
      )}

      {hasMarkReadField && (
        <InboxThreadReadToggleButton
          style={!threadData.entityAtBottom && styles.threadItemActionWithSettings}
          messages={_thread.messages}
          onReadChange={(messages: InboxThreadMessage[], read: boolean) => {
            doToggleMessagesRead(messages, read);
          }}
        />
      )}

      {(!isMergedNotifications.current && !isSwipeEnabled.current) && renderedComponent}

      {isSwipeEnabled.current && (
        (() => {
          const actionText: [string, string] = [i18n('Mark as read'), i18n('Mark as unread')];
          return (
            <SwipeableRowWithHint
              enabled={hasMarkReadField}
              direction={swipeDirection.left}
              actionText={actionText}
              onSwipe={() => doToggleMessagesRead(_thread.messages, hasUnreadMessage)}
              showHint={showSwipeHint}
              hintDistance={150}
              hintDirection={swipeDirection.left}
              onAfterHintShow={onAfterHintShow}
            >
              <View style={styles.threadContainer}>{renderedComponent}</View>
            </SwipeableRowWithHint>
          );
        })()
      )}
    </View>
  );

  function renderSettings() {
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
        execute: () =>
          doToggleMessagesRead(_thread.messages, hasUnreadMessage, true),
      },
      {
        title: i18n('Cancel'),
      },
    ];
    return (
      <View style={styles.threadTitleActions}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={!isOnline}
          testID="test:id/inboxThreadsThreadSettings"
          accessibilityLabel="inboxThreadsThreadSettings"
          accessible={true}
          onPress={() => {
            showActionSheetWithOptions(
              {
                ...defaultActionsOptions(uiTheme),
                options: options.map(action => action.title),
                title: `${threadData.entity?.idReadable} ${threadData.entity?.summary}`,
                cancelButtonIndex: options.length - 1,
              },
              (index?: number) => options[(index as number)]?.execute?.(),
            );
          }}
          style={styles.threadTitleAction}
        >
          <IconMoreOptions color={isOnline ? styles.icon.color : styles.disabled.color}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

function createThreadData(thread: InboxThread, mergedNotifications?: boolean): ThreadData {
  const threadData: ThreadData = {
    entity: null,
    component: null,
    entityAtBottom: false,
  };

  if (thread.id) {
    const target = thread.subject.target;
    threadData.entity = target?.issue || target?.article || target;
    const threadTypeData: ThreadTypeData = getThreadTypeData(thread);
    threadData.component = (
      threadTypeData.isReaction
        ? InboxThreadReaction
        : threadTypeData.isMention ? InboxThreadMention : InboxThreadItemSubscription
    );
    threadData.entityAtBottom = mergedNotifications ? false : threadTypeData.isReaction || threadTypeData.isMention;
  }

  return threadData;
}

export default Thread;
export {createThreadData};
