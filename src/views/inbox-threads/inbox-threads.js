/* @flow */

import React, {useCallback, useContext, useEffect} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import Thread from './inbox-threads__thread';
import {i18n} from 'components/i18n/i18n';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {User} from 'flow/User';


const InboxThreads: () => Node = (): Node => {
  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const threads: InboxThread[] = useSelector((state: AppState) => state.inboxThreads.threads);
  const hasMore: boolean = useSelector((state: AppState) => state.inboxThreads.hasMore);
  const currentUser: User = useSelector((state: AppState) => state.app.user);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);
  const loadThreads = useCallback(
    (end?: number) => {dispatch(actions.loadInboxThreads(end));},
    [dispatch]
  );

  useEffect(loadThreads, [loadThreads]);

  const getVisibleThreads = useCallback(() => {
    return threads.slice(0, threads.length - (hasMore ? 1 : 0));
  }, [hasMore, threads]);

  const getNextThreadsEnd = useCallback(() => {
    return threads[threads.length - 1].notified - 1;
  }, [threads]);

  const renderItem = ({item, index}: { item: InboxThread, index: number, ... }) => (
    <Thread
      testID="test:id/inboxThreadsThread"
      accessibilityLabel="inboxThreadsThread"
      accessible={true}
      style={[styles.thread, (index === threads.length - (hasMore ? 2 : 1)) && styles.threadLast]}
      thread={item}
      currentUser={currentUser}
      uiTheme={theme.uiTheme}
    />
  );

  return (
    <View
      style={styles.container}
      testID="test:id/inboxThreads"
      accessibilityLabel="inboxThreads"
      accessible={true}
    >
      <Header
        showShadow={true}
        title={i18n('Notifications')}
      />

      <FlatList
        data={getVisibleThreads()}
        ItemSeparatorComponent={() => <View style={styles.threadSeparator}/>}
        keyExtractor={(it: InboxThread) => it.id}
        onEndReachedThreshold={5}
        onEndReached={() => {
          if (hasMore && !inProgress) {
            loadThreads(getNextThreadsEnd());
          }
        }}
        refreshControl={<RefreshControl
          refreshing={inProgress}
          tintColor={styles.link.color}
          onRefresh={loadThreads}
        />}
        renderItem={renderItem}
      />

      {!!error && !inProgress && (
        <View style={styles.error}>
          <ErrorMessage error={error}/>
        </View>
      )}
    </View>
  );
};


export default InboxThreads;
