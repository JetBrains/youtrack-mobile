/* @flow */

import React, {useContext} from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import ErrorMessage from 'components/error-message/error-message';
import Thread from './inbox-threads__thread';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconNothingFound} from 'components/icon/icon-pictogram';
import {SkeletonIssueActivities, SkeletonIssues} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {UserCurrent} from 'flow/User';

interface Props {
  folderId: string;
  onLoadMore: (end: number) => any,
  onPress?: ?(entity: ThreadEntity, navigateToActivity?: boolean) => any,
  threadsData: any,
}

const InboxThreadsList = ({
  folderId,
  onLoadMore,
  onPress,
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
      onPress={onPress}
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
            return folderId !== folderIdMap[1]
              ? <SkeletonIssues marginTop={UNIT * 1.5}/>
              : <SkeletonIssueActivities marginTop={UNIT * 2} marginLeft={UNIT} marginRight={UNIT}/>;
          }

          if (!getData().threads.length && !inProgress) {
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
          onRefresh={() => onLoadMore(null)}
        />}
        renderItem={renderItem}
      />
    </View>
  );
};


export default React.memo<Props>(InboxThreadsList, (prev: Props, next: Props) => {
  return prev?.threadsData === next?.threadsData;
});
