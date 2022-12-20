import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {folderIdMap} from './inbox-threads-helper';
import {i18n} from 'components/i18n/i18n';
import {
  loadInboxThreads,
  markFolderSeen,
  setInProgress,
} from './inbox-threads-actions';
import styles from './inbox-threads.styles';
import type {AppState} from '../../reducers';
import type {InboxFolder} from 'flow/Inbox';

const InboxThreadsUpdateButton = ({index}: {index: number}) => {
  const dispatch = useDispatch();
  const inboxThreadsFolders: InboxFolder[] = useSelector(
    (state: AppState) => state.app.inboxThreadsFolders,
  );
  const inProgress: boolean = useSelector(
    (state: AppState) => state.inboxThreads.inProgress,
  );

  const isUpdateButtonVisible = (): boolean => {
    if (index === 0) {
      return inboxThreadsFolders.some(
        (it: InboxFolder) => it.lastNotified > it.lastSeen,
      );
    }

    const inboxFolder: InboxFolder | null | undefined =
      inboxThreadsFolders[index - 1];
    return inboxFolder
      ? inboxFolder.lastNotified > inboxFolder.lastSeen
      : false;
  };

  return (
    !inProgress &&
    isUpdateButtonVisible() && (
      <View style={styles.threadUpdateButtonContainer}>
        <TouchableOpacity
          style={styles.threadUpdateButton}
          disabled={inProgress}
          onPress={async () => {
            dispatch(setInProgress(true));
            await dispatch(markFolderSeen(folderIdMap[index]), Date.now());
            dispatch(loadInboxThreads(folderIdMap[index], null, true));
            dispatch(setInProgress(false));
          }}
        >
          <Text style={styles.threadUpdateButtonText}>
            {i18n('New messages')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  );
};

export default React.memo(InboxThreadsUpdateButton);