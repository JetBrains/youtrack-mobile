/* @flow */

import React, {useContext, useEffect} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import InboxEntity from '../inbox/inbox__entity';
import Router from 'components/router/router';
import Thread from './inbox-threads__thread';
import {getThreadEntity} from './inbox-threads-helper';
import {guid} from 'util/util';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {AnyIssue} from '../../flow/Issue';
import type {Article} from '../../flow/Article';


const InboxThreads: () => Node = (): Node => {
  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const threads: Array<InboxThread> = useSelector((state: AppState) => state.inboxThreads.threads);
  const currentUser: User = useSelector((state: AppState) => state.app.user);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);
  const doRefresh = () => {dispatch(actions.loadInboxThreads());};

  useEffect(
    doRefresh,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View style={styles.container}>
      <Header
        showShadow={true}
        title="Notifications"
      />

      {threads.length > 0 && (
        <ScrollView
          refreshControl={<RefreshControl
            refreshing={inProgress}
            tintColor={styles.link.color}
            onRefresh={doRefresh}
          />}
        >
          {threads.map((thread: InboxThread, index: number) => {
            const isLast: boolean = index === threads.length - 1;
            if (!thread.messages.length) {
              return null;
            }
            const entity: (AnyIssue | Article) = getThreadEntity(thread);
            return <View
              key={guid()}
              style={[styles.thread, isLast && styles.threadLast]}
            >
              <InboxEntity
                entity={entity}
                onNavigate={() => Router.Issue({issueId: entity.id, navigateToActivity: true})}
                style={styles.threadTitle}
              />
              <Thread
                key={guid()}
                thread={thread}
                currentUser={currentUser}
                uiTheme={theme.uiTheme}
              />
            </View>;
          })}
        </ScrollView>
      )}

      {!!error && !inProgress && (
        <View style={styles.error}>
          <ErrorMessage error={error}/>
        </View>
      )}
    </View>
  );
};


export default InboxThreads;
