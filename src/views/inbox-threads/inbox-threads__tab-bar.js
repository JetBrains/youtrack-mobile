/* @flow */

import React, {useRef, useContext, useEffect, useState} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';

import {IconCircle} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import {useDispatch, useSelector} from 'react-redux';

import {folderIdMap} from './inbox-threads-helper';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import {loadInboxThreads, markFolderSeen, setInProgress} from './inbox-threads-actions';
import {ModalPortalPart} from 'components/modal-view/modal-portal';
import {splitViewLeftSideBarWidth} from 'components/common-styles/split-view';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {InboxFolder} from 'flow/Inbox';
import type {TabRoute} from 'flow/Issue';
import type {Theme} from 'flow/Theme';


const InboxThreadsTabBar = ({route, focused, index}: { route: TabRoute, focused: boolean, index: number }) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const theme: Theme = useContext(ThemeContext);
  const refEl = useRef();

  const inboxThreadsFolders: InboxFolder[] = useSelector((state: AppState) => state.app.inboxThreadsFolders);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const [topPosition, updateTopPosition] = useState(null);

  const tabHasUpdates = (): boolean => {
    const folder: ?InboxFolder = inboxThreadsFolders.find((it: InboxFolder) => it.id === route.id);
    return !!folder && (folder.lastNotified > folder.lastSeen);
  };

  const isUpdateButtonVisible = (): boolean => {
    if (index === 0) {
      return inboxThreadsFolders.filter(
        (it: InboxFolder) => it.id === folderIdMap[0] || it.id === folderIdMap[1]
      ).some(
        (it: InboxFolder) => it.lastNotified > it.lastSeen
      );
    }
    return tabHasUpdates();
  };

  const measurePosition = () => refEl?.current?.measure(
    (fx, fy, width, height, px, py) => updateTopPosition(py + height / 1.4)
  );

  useEffect(() => {
    const dimensionsChangeListener = Dimensions.addEventListener('change', measurePosition);
    return () => dimensionsChangeListener?.remove();
  }, []);

  return (
    <View
      collapsable={false}
      ref={refEl}
      onLayout={measurePosition}
    >
      <Text
        style={[
          tabStyles.tabLabelText,
          focused && {color: styles.link.color},
        ]}
      >
        {route.title}
      </Text>
      {!focused && index > 0 && tabHasUpdates() && (
        <IconCircle
          size={9}
          color={styles.link.color}
          style={styles.tabTitleIconUnread}
        />
      )}

      <ModalPortalPart
        style={{
          top: topPosition,
          opacity: !topPosition ? 0 : 1,
          width: isSplitView() ? splitViewLeftSideBarWidth : null,
        }}
        isVisible={!inProgress && index === route.key && isUpdateButtonVisible()}
      >
        <TouchableOpacity
          disabled={inProgress}
          onPress={async () => {
            dispatch(setInProgress(true));
            await dispatch(markFolderSeen(folderIdMap[index]), Date.now());
            dispatch(loadInboxThreads(folderIdMap[index], null, true));
            dispatch(setInProgress(false));
          }}
          style={styles.threadUpdateButton}>
          <Text style={styles.threadUpdateButtonText}>{i18n('Update')}</Text>
        </TouchableOpacity>
      </ModalPortalPart>
    </View>
  );
};


export default React.memo(InboxThreadsTabBar);
