/* @flow */

import React, {useContext} from 'react';
import {Text, View} from 'react-native';

import {IconCircle} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import {useSelector} from 'react-redux';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {InboxFolder} from 'flow/Inbox';
import type {TabRoute} from 'flow/Issue';
import type {Theme, UIThemeColors} from 'flow/Theme';

const InboxThreadsTabBar = ({route, focused, index}: {route: TabRoute, focused: boolean, index: number}) => {
  const theme: Theme = useContext(ThemeContext);
  const uiThemeColors: UIThemeColors = theme.uiTheme.colors;

  const inboxThreadsFolders: InboxFolder[] = useSelector((state: AppState) => state.app.inboxThreadsFolders);

  const hasTabUpdates = (inboxFolders: InboxFolder[], folderId?: string): boolean => {
    const folder: ?InboxFolder = inboxFolders.find((it: InboxFolder) => it.id === folderId);
    return !!folder && (folder.lastNotified > folder.lastSeen);
  };


  return (
    <View>
      <Text
        style={[
          tabStyles.tabLabelText,
          {color: focused ? uiThemeColors.$link : uiThemeColors.$text},
        ]}
      >
        {route.title}
      </Text>
      {route.key !== index && index > 0 && hasTabUpdates(inboxThreadsFolders, route.id) && (
        <IconCircle
          size={9}
          color={styles.link.color}
          style={styles.tabTitleIconUnread}
        />
      )}
    </View>
  );
};


export default React.memo(InboxThreadsTabBar);
