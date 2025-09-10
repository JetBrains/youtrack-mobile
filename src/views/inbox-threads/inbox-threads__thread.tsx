import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch} from 'hooks/use-dispatch';
import {useSelector} from 'react-redux';

import animation from 'components/animation/animation';
import InboxEntity from '../inbox/inbox__entity';
import InboxThreadReadToggleButton from 'views/inbox-threads/inbox-threads__read-toggle-button';
import Swipeable from 'components/swipeable/swipeable';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isUnreadOnly, muteToggle, updateThreadRead, updateThreadsStateAndCache} from './inbox-threads-actions';
import {ThreadSettings} from 'views/inbox-threads/inbox-threads__thread-settings';
import {useThread} from 'views/inbox-threads/inbox-threads__use-thread';
import {IconMarkRead, IconMarkUnread} from 'components/icon/icon';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';
import type {Entity} from 'types/Entity';
import type {InboxThread, InboxThreadMessage, InboxThreadTarget} from 'types/Inbox';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  currentUser: User;
  onNavigate: (entity: Entity | InboxThreadTarget, navigateToActivity?: string, commentId?: string) => void;
  thread: InboxThread;
  uiTheme: UITheme;
  style?: ViewStyleProp;
}

function Thread({thread, currentUser, uiTheme, onNavigate, style}: Props) {
  const {showActionSheetWithOptions} = useActionSheet();

  const dispatch = useDispatch();
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);

  const [_thread, updateThread] = useState<InboxThread>(thread);
  const {entity, ThreadView, isBottomPositioned} = useThread(_thread);
  const [isRead, setIsRead] = useState<boolean>(!thread.messages.some(it => !it.read));
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    updateThread(thread);
  }, [thread]);

  const toggleRead = async (read: boolean) => {
    const updatedThread: InboxThread = {
      ..._thread,
      messages: _thread.messages.map(m => ({...m, read})),
    };
    updateThread(updatedThread);
    setIsRead(read);
    await dispatch(updateThreadRead(_thread.id, _thread.updated, read));
    setIsUpdating(false);
    dispatch(updateThreadsStateAndCache(updatedThread));
    if (isUnreadOnly()) {
      animation.layoutAnimation();
    }
  };

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
      title: isRead ? i18n('Mark as unread') : i18n('Mark as read'),
      execute: () => toggleRead(!isRead),
    },
    {
      title: i18n('Cancel'),
    },
  ];

  const hasSettings = hasType.issue(entity) || hasType.article(entity);
  const hasReadField = typeof _thread.messages?.[0]?.read === 'boolean';
  const Entity = (
    <InboxEntity
      testID="test:id/inboxEntity"
      accessibilityLabel="inboxEntity"
      accessible={true}
      entity={entity}
      onNavigate={() => onNavigate(entity)}
      style={[
        styles.threadTitle,
        isBottomPositioned && styles.threadSubTitle,
      ]}
      styleText={isBottomPositioned && styles.threadSubTitleText}
    />
  );

  return (
    <View
      testID="test:id/inboxThreadsListThread"
      accessibilityLabel="inboxThreadsListThread"
      accessible={true}
      style={style}
    >
      {!isBottomPositioned && (
        <View style={hasSettings && styles.threadTitleContainer}>
          <View style={styles.threadTitleContent}>
            {Entity}
            {hasSettings && (
              <ThreadSettings
                options={options}
                uiTheme={uiTheme}
                title={`${entity?.idReadable}${
                  entity && 'summary' in entity ? ` ${entity.summary}` : ''
                }`}
                showActionSheetWithOptions={showActionSheetWithOptions}
              />
            )}
          </View>
        </View>
      )}

      {hasReadField && (
        <InboxThreadReadToggleButton
          style={!isBottomPositioned && styles.threadItemActionWithSettings}
          read={isRead}
          onReadChange={(read: boolean) => {
            toggleRead(read);
          }}
        />
      )}

      <Swipeable
        leftAction={{
          icon: !isRead ? <IconMarkRead size={12} /> : <IconMarkUnread size={12} />,
          onSwipe: () => {
            setIsUpdating(true);
            toggleRead(!isRead);
          },
        }}
        enabled={hasReadField && !inProgress && !isUpdating}
        swipeToEdge={true}
        syncUpdate={isUnreadOnly()}
      >
        <View style={styles.threadContainer}>
          <ThreadView
            thread={_thread}
            currentUser={currentUser}
            uiTheme={uiTheme}
            onNavigate={onNavigate}
            onReadChange={(messages: InboxThreadMessage[], read: boolean) => {
              toggleRead(read);
            }}
          />
          {isBottomPositioned && <View style={styles.threadTitleContainerBottom}>{Entity}</View>}
        </View>
      </Swipeable>
    </View>
  );
}

export default Thread;
