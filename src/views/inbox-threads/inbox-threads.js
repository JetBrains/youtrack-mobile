/* @flow */

import React, {useContext, useEffect} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadItemSubscription from './inbox-threads__subscription';
import {guid} from 'util/util';
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

  const threads: Array<InboxThread> = useSelector((state: AppState) => state.inboxThreads.threads);
  const currentUser: User = useSelector((state: AppState) => state.app.user);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);

  useEffect(() => {
    dispatch(actions.loadInboxThreads());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Thread({thread, isLast}: { thread: InboxThread, isLast: boolean }) {
    if (thread.id) {
      switch (thread.id[0]) {
      case 'R':
        return (
          <InboxThreadReaction
            style={[styles.thread, isLast && styles.threadLast]}
            thread={thread}
            currentUser={currentUser}
            uiTheme={theme.uiTheme}
          />
        );
      case 'M':
        return (
        <InboxThreadMention
          style={[styles.thread, isLast && styles.threadLast]}
          thread={thread}
          currentUser={currentUser}
          uiTheme={theme.uiTheme}
        />
      );
      case 'S':
        return (
          <InboxThreadItemSubscription
            style={[styles.thread, isLast && styles.threadLast]}
            thread={thread}
            currentUser={currentUser}
            uiTheme={theme.uiTheme}
          />
        );
      }
    }
    return null;
  }

  return (
    <View style={styles.container}>
      <Header
        showShadow={true}
        title="Notifications"
      />

      {threads.length === 0 && !error && inProgress && (
        <ActivityIndicator color={styles.link.color} style={StyleSheet.absoluteFillObject}/>
      )}

      {threads.length > 0 && (
        <ScrollView>
          {threads.map((thread: InboxThread, index: number) => (
            thread.messages.length && <Thread key={guid()} thread={thread} isLast={index === threads.length - 1}/>
          ))}
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
