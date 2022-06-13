/* @flow */

import React, {useCallback, useEffect} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Thread from './inbox-threads__thread';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {UserCurrent} from 'flow/User';

interface Props {
  currentUser: UserCurrent;
  folderId: string;
  theme: Theme;
}


const InboxThreadsList = ({currentUser, folderId, theme, ...other}: Props): Node => {
  const dispatch = useDispatch();
  const threads: InboxThread[] = useSelector((state: AppState) => state.inboxThreads.threads);
  const hasMore: boolean = useSelector((state: AppState) => state.inboxThreads.hasMore);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);

  const loadThreads = useCallback(
    (end?: number) => {dispatch(actions.loadInboxThreads(folderId, end));},
    [dispatch, folderId]
  );

  useEffect(() => {
    loadThreads();
  }, [folderId, loadThreads]);


  const renderItem = ({item, index}: { item: InboxThread, index: number, ... }) => (
    <Thread
      style={[styles.thread, (index === threads.length - (hasMore ? 2 : 1)) && styles.threadLast]}
      thread={item}
      currentUser={currentUser}
      uiTheme={theme.uiTheme}
    />
  );

  const visibleThreads: InboxThread[] = hasMore ? threads.slice(0, threads.length - 1) : threads;
  return <View
    testID="test:id/inboxThreads"
    accessibilityLabel="inboxThreads"
    accessible={true}
    {...other}
  >
    <FlatList
      removeClippedSubviews={false}
      data={visibleThreads}
      ItemSeparatorComponent={() => <View style={styles.threadSeparator}/>}
      ListFooterComponent={() => {
        if (error && !inProgress) {
          return <ErrorMessage error={error} style={styles.error}/>;
        }
        return null;
      }}
      keyExtractor={(it: InboxThread) => it.id}
      onEndReachedThreshold={5}
      onEndReached={() => {
        if (hasMore && !inProgress) {
          loadThreads(threads.slice(-1)[0].notified);
        }
      }}
      refreshControl={<RefreshControl
        refreshing={false}
        tintColor={styles.link.color}
        onRefresh={loadThreads}
      />}
      renderItem={renderItem}
    />
  </View>;
};


export default React.memo<Props>(InboxThreadsList, (prev: Props, next: Props) => {
  return (
    prev.currentUser?.id === next.currentUser?.id &&
    prev.folderId === next.folderId &&
    prev.theme === next.theme
  );
});
