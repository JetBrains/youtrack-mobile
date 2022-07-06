/* @flow */

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, Linking, Text, TouchableOpacity, View} from 'react-native';

import {TabBar, TabView} from 'react-native-tab-view';
import {useDispatch, useSelector} from 'react-redux';

import Article from 'views/article/article';
import Header from 'components/header/header';
import InboxThreadsList from './inbox-threads__list';
import Issue from '../issue/issue';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {folderIdMap, threadTabsTitles} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {isSplitView as hasSplitView} from 'components/responsive/responsive-helper';
import {markAllAsRead} from './inbox-threads-actions';
import {ThemeContext} from 'components/theme/theme-context';
import {useActionSheet} from '@expo/react-native-action-sheet';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {Node} from 'react';
import type {TabRoute} from 'flow/Issue';
import type {Theme, UIThemeColors} from 'flow/Theme';
import type {ThreadEntity} from 'flow/Inbox';
import type {UserCurrent} from 'flow/User';


const InboxThreads: () => Node = (): Node => {
  const dispatch = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();

  const theme: Theme = useContext(ThemeContext);
  const currentUser: UserCurrent = useSelector((state: AppState) => state.app.user);
  const routes: TabRoute[] = threadTabsTitles.map((name: string, index: number) => ({key: index, title: name}));

  const [selectedEntity, updateSelectedEntity] = useState({entity: null, navigateToActivity: false});

  const [isSplitView, updateIsSplitView] = useState(hasSplitView());
  const dimensionsChangeListener = useRef();

  useEffect(() => {
    dimensionsChangeListener.current = Dimensions.addEventListener('change', () => {
      updateIsSplitView(hasSplitView());
    });
    return () => dimensionsChangeListener.current?.remove();
  }, []);

  const [navigationState, updateNavigationState] = useState({
    index: 0,
    routes,
  });

  const renderScene = ({route}: { route: TabRoute }) => (
    <InboxThreadsList
      currentUser={currentUser}
      folderId={folderIdMap[route.key]}
      theme={theme}
      onPress={(isSplitView
        ? (entity: ThreadEntity, navigateToActivity?: boolean) => updateSelectedEntity({entity, navigateToActivity})
        : null)}
    />
  );

  const renderTabBar = (props: any) => {
    const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
    return (
      <TabBar
        {...props}
        pressColor={uiThemeColors.$disabled}
        indicatorStyle={{backgroundColor: uiThemeColors.$link}}
        style={[tabStyles.tabsBar, {shadowColor: uiThemeColors.$separator}]}
        tabStyle={tabStyles.tabsBarFluid}
        renderLabel={({route, focused}) => (
          <Text style={[
            tabStyles.tabLabelText,
            {color: focused ? uiThemeColors.$link : uiThemeColors.$text},
          ]}>
            {route.title}
          </Text>
        )}
        scrollEnabled={true}
      />
    );
  };

  const renderEntity = () => {
    if (!selectedEntity?.entity) {
      return <NothingSelectedIconWithText text={i18n('Select an issue, article or change from the list')}/>;
    }

    return (
      hasType.article(selectedEntity.entity)
        ? <Article articlePlaceholder={selectedEntity.entity} navigateToActivity={selectedEntity.navigateToActivity}/>
        : (
          <Issue
            issuePlaceholder={selectedEntity.entity}
            issueId={selectedEntity.entity.id}
            navigateToActivity={selectedEntity.navigateToActivity}
          />
        )
    );
  };

  const renderTabs = () => (
    <TabView
      lazy={true}
      swipeEnabled={true}
      navigationState={navigationState}
      renderScene={renderScene}
      initialLayout={{
        height: 0,
        width: Dimensions.get('window').width,
      }}
      renderTabBar={renderTabBar}
      onIndexChange={(index: number) => updateNavigationState({index, routes})}
    />
  );

  const renderHeader = () => (
    <Header
      title={i18n('Notifications')}
      rightButton={<TouchableOpacity
        testID="test:id/inboxSettings"
        accessibilityLabel="inboxSettings"
        accessible={true}
        onPress={() => {
          const inboxThreadsCache = getStorageState().inboxThreadsCache;
          const options = [
            {
              title: inboxThreadsCache?.unreadOnly ? i18n('Show all') : i18n('Show unread only'),
              execute: async () => {
                flushStoragePart({
                  inboxThreadsCache: {
                    ...inboxThreadsCache,
                    unreadOnly: !inboxThreadsCache?.unreadOnly,
                  },
                });
              },
            },
            {
              title: i18n('Mark all as read'),
              execute: () => {
                dispatch(markAllAsRead());
              },
            },
            {
              title: i18n('Notification settings…'),
              execute: () => Linking.openURL(
                `${getStorageState().config.backendUrl}/users/me?tab=notifications`
              ),
            },
            {
              title: i18n('Cancel'),
            },
          ];

          showActionSheetWithOptions(
            {
              ...defaultActionsOptions,
              options: options.map(action => action.title),
              cancelButtonIndex: options.length - 1,
            },
            (index: number) => options[index]?.execute && options[index].execute()
          );
        }}
        style={styles.threadTitleAction}
      >
        <IconMoreOptions
          size={18}
          color={styles.link.color}
        />
      </TouchableOpacity>}
    />
  );

  return (
    <View
      testID="test:id/inboxThreads"
      accessibilityLabel="inboxThreads"
      accessible={true}
      style={[
      styles.container,
      isSplitView ? styles.splitViewContainer : null,
    ]}>

      {!isSplitView && <>
        {renderHeader()}
        {renderTabs()}
      </>}
      {isSplitView && <>
        <View style={styles.splitViewSide}>
          {renderHeader()}
          {renderTabs()}
        </View>
        <View style={styles.splitViewMain}>
          {renderEntity()}
        </View>
      </>}
    </View>
  );
};


export default InboxThreads;
