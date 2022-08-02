/* @flow */

import React, {useContext} from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import ErrorMessage from 'components/error-message/error-message';
import InboxThreadsProgressPlaceholder from './inbox-threads__progress-placeholder';
import Thread from './inbox-threads__thread';
import {folderIdAllKey} from './inbox-threads-helper';
import {getFolderCachedThreads} from './inbox-threads-actions';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconNothingFound} from 'components/icon/icon-pictogram';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {UserCurrent} from 'flow/User';

interface Props {
  folderId: string;
  onLoadMore: (end?: number) => any,
  onNavigate: (entity: ThreadEntity, navigateToActivity?: string) => any,
  threadsData: any,
}

const InboxThreadsList = ({
  folderId,
  onLoadMore,
  onNavigate,
  threadsData,
}: Props): Node => {
  const theme: Theme = useContext(ThemeContext);

  const currentUser: UserCurrent = useSelector((state: AppState) => state.app.user);
  const error: UserCurrent = useSelector((state: AppState) => state.inboxThreads.error);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);

  const getData = () => threadsData[folderId || folderIdAllKey] || {threads: [], hasMore: false};

  const renderItem = ({item, index}: { item: InboxThread, index: number, ... }) => (
    <Thread
      style={[
        styles.thread,
        (index === getData().threads.length - (getData().hasMore ? 2 : 1)) && styles.threadLast,
      ]}
      thread={item}
      currentUser={currentUser}
      uiTheme={theme.uiTheme}
      onNavigate={onNavigate}
    />
  );

  const visibleThreads: InboxThread[] = (
    getData().hasMore
      ? getData().threads.slice(0, getData().threads.length - 1)
      : getData().threads
  );

  return (
    <View
      testID="test:id/inboxThreadsList"
      accessibilityLabel="inboxThreadsList"
      accessible={true}
    >
      <FlatList
        removeClippedSubviews={false}
        data={visibleThreads}
        ItemSeparatorComponent={() => <View style={styles.threadSeparator}/>}
        ListFooterComponent={() => {
          if (error) {
            return <ErrorMessage error={error} style={styles.error}/>;
          }
          if (inProgress) {
            return <InboxThreadsProgressPlaceholder/>;
          }

          if (!Object.keys(threadsData).length && !inProgress && !getFolderCachedThreads(folderId).length && !getData().threads.length) {
            return <View style={styles.threadsEmpty}>
              <IconNothingFound/>
              <Text style={styles.threadsEmptyMessage}>
                {getStorageState()?.inboxThreadsCache?.unreadOnly === true
                  ? i18n('You don’t have any unread notifications')
                  : i18n('No notifications')
                }
              </Text>
            </View>;
          }
          return null;
        }}
        keyExtractor={(it: InboxThread) => it.id}
        onEndReachedThreshold={1}
        onEndReached={() => {
          if (getData().hasMore && !inProgress) {
            onLoadMore(getData().threads.slice(-1)[0].notified);
          }
        }}
        refreshControl={<RefreshControl
          refreshing={false}
          tintColor={styles.link.color}
          onRefresh={onLoadMore}
        />}
        renderItem={renderItem}
      />
    </View>
  );
};


export default InboxThreadsList;
