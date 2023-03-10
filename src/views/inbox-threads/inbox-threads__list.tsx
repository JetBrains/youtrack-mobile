import React, {useCallback, useContext, useEffect} from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import InboxThreadsProgressPlaceholder from './inbox-threads__progress-placeholder';
import Thread from './inbox-threads__thread';
import {folderIdAllKey} from './inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconNoNotifications} from 'components/icon/icon-pictogram';
import {isUnreadOnly} from './inbox-threads-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {AppState} from 'reducers';
import type {CustomError} from 'types/Error';
import type {InboxThread, ThreadData, ThreadEntity} from 'types/Inbox';
import type {Theme} from 'types/Theme';
import type {User} from 'types/User';

type Props = {
  folderId: string | undefined;
  onNavigate: (
    entity: ThreadEntity,
    navigateToActivity?: string,
    commentId?: string,
  ) => any;
  merger?: (threads: InboxThread[]) => InboxThread[];
};


const InboxThreadsList = ({folderId, onNavigate, merger}: Props): JSX.Element => {
  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();
  const currentUser: User = useSelector(
    (state: AppState) => state.app.user,
  );
  const error: CustomError = useSelector(
    (state: AppState) => state.inboxThreads.error,
  );
  const inProgress: boolean = useSelector(
    (state: AppState) => state.inboxThreads.inProgress,
  );
  const threadsData: ThreadData =
    useSelector((state: AppState) => state.inboxThreads.threadsData) || {};

  const getData = () =>
    threadsData[folderId || folderIdAllKey] || {
      threads: [],
      hasMore: false,
    };

  const setThreadsFromCache = useCallback(
    (id?: string): void => {
      dispatch(actions.loadThreadsFromCache(id));
    },
    [dispatch],
  );
  const loadThreads = useCallback(
    (id?: string, end?: number, showProgress?: boolean) => {
      dispatch(actions.loadInboxThreads(id, end, showProgress, merger));
    },
    [dispatch, merger],
  );
  useEffect(() => {
    setThreadsFromCache(folderId);
    loadThreads(folderId);
  }, [folderId, loadThreads, setThreadsFromCache]);

  const renderItem = ({item, index}: {item: InboxThread; index: number}) => {
    const mergedNotifications: boolean = !!getStorageState().mergedNotifications;
    return (
      <Thread
        style={[
          styles.thread,
          index === 0 && !mergedNotifications && styles.threadFirst,
          index === 0 && mergedNotifications && styles.threadFirstMerged,
          index === getData().threads.length - (getData().hasMore ? 2 : 1) && styles.threadLast,
        ]}
        thread={item}
        currentUser={currentUser}
        uiTheme={theme.uiTheme}
        onNavigate={onNavigate}
      />
    );
  };

  const visibleThreads: InboxThread[] = (getData().hasMore
    ? getData().threads.slice(0, getData().threads.length - 1)
    : getData().threads
  ).filter((it: InboxThread) => it.messages.length > 0);
  const hasVisibleMessages: boolean =
    visibleThreads.length > 0 &&
    visibleThreads.reduce(
      (amount: number, it: InboxThread) => amount + it.messages.length,
      0,
    ) > 0;
  return (
    <View
      testID="test:id/inboxThreadsList"
      accessibilityLabel="inboxThreadsList"
      accessible={true}
      style={styles.threadsList}
    >
      <FlatList
        contentContainerStyle={styles.threadsListContainer}
        removeClippedSubviews={false}
        data={visibleThreads}
        ItemSeparatorComponent={() => <View style={styles.threadSeparator} />}
        ListFooterComponent={() => {
          if (error) {
            return (
              <ErrorMessage
                testID="test:id/inboxThreadsListError"
                error={error}
                style={styles.error}
              />
            );
          }

          if (inProgress) {
            return <InboxThreadsProgressPlaceholder />;
          }

          if (!hasVisibleMessages) {
            return (
              <View
                testID="test:id/inboxThreadsListEmptyMessage"
                accessibilityLabel="inboxThreadsListEmptyMessage"
                accessible={true}
                style={styles.threadsEmpty}
              >
                <IconNoNotifications />
                <Text
                  testID="test:id/inboxThreadsListEmptyMessageText"
                  accessibilityLabel="inboxThreadsListEmptyMessageText"
                  accessible={true}
                  style={styles.threadsEmptyText}
                >
                  {isUnreadOnly()
                    ? i18n('You don’t have any unread notifications')
                    : i18n('No notifications')}
                </Text>
              </View>
            );
          }

          return null;
        }}
        keyExtractor={(it: InboxThread) => it.id}
        onEndReachedThreshold={1}
        onEndReached={() => {
          if (getData().hasMore && !inProgress) {
            loadThreads(folderId, getData().threads.slice(-1)[0].notified);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={styles.link.color}
            onRefresh={() => loadThreads(folderId)}
          />
        }
        renderItem={renderItem}
      />
    </View>
  );
};

export default InboxThreadsList;
