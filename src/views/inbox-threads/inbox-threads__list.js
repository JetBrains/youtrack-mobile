/* @flow */

import React from 'react';
import {FlatList, RefreshControl, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Thread from './inbox-threads__thread';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {IconNothingFound} from 'components/icon/icon-pictogram';
import {SkeletonIssueActivities, SkeletonIssues} from 'components/skeleton/skeleton';
import {UNIT} from 'components/variables/variables';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {UserCurrent} from 'flow/User';

interface Props {
  currentUser: UserCurrent;
  folderId: string;
  theme: Theme;
  onPress?: ?(entity: ThreadEntity, navigateToActivity?: boolean) => any,
}


const InboxThreadsList = ({currentUser, folderId, theme, onPress, ...other}: Props): Node => {
  const dispatch = useDispatch();
  const threadsData: { threads: InboxThread[], hasMore: boolean } = useSelector(
    (state: AppState) => state.inboxThreads.threadsData[folderId || folderIdAllKey] || {threads: []}
  );
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);

  const loadThreads = (_folderId?: ?string, end?: number | null) => {
    dispatch(actions.loadInboxThreads(_folderId, end));
  };

  const renderItem = ({item, index}: { item: InboxThread, index: number, ... }) => (
    <Thread
      style={[
        styles.thread,
        (index === threadsData.threads.length - (threadsData.hasMore ? 2 : 1)) && styles.threadLast,
      ]}
      thread={item}
      currentUser={currentUser}
      uiTheme={theme.uiTheme}
      onPress={onPress}
    />
  );

  const visibleThreads: InboxThread[] = (
    threadsData.hasMore
      ? threadsData.threads.slice(0, threadsData.threads.length - 1)
      : threadsData.threads
  );
  return <View
    testID="test:id/inboxThreadsList"
    accessibilityLabel="inboxThreadsList"
    accessible={true}
    {...other}
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

        if (!visibleThreads.length && !inProgress) {
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
      onEndReachedThreshold={5}
      onEndReached={() => {
        if (threadsData.hasMore && !inProgress) {
          loadThreads(folderId, threadsData.threads.slice(-1)[0].notified);
        }
      }}
      refreshControl={<RefreshControl
        refreshing={false}
        tintColor={styles.link.color}
        onRefresh={() => loadThreads(folderId, null)}
      />}
      renderItem={renderItem}
    />
  </View>;
};


export default InboxThreadsList;
