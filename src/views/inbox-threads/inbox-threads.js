/* @flow */

import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, Linking, TouchableOpacity, View} from 'react-native';

import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch, useSelector} from 'react-redux';

import * as actions from './inbox-threads-actions';
import Article from 'views/article/article';
import Header from 'components/header/header';
import InboxThreadsProgressPlaceholder from './inbox-threads__progress-placeholder';
import InboxThreadsList from './inbox-threads__list';
import InboxThreadsTabBar from './inbox-threads__tab-bar';
import Issue from '../issue/issue';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import Router from 'components/router/router';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {folderIdMap, threadTabsTitles} from './inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {isSplitView as hasSplitView} from 'components/responsive/responsive-helper';
import {markAllAsRead} from './inbox-threads-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {Node} from 'react';
import type {TabRoute} from 'flow/Issue';
import type {Theme, UIThemeColors} from 'flow/Theme';
import type {ThreadEntity} from 'flow/Inbox';

const routes: TabRoute[] = threadTabsTitles.map((name: string, index: number) => ({
  key: index,
  title: name,
  id: folderIdMap[index],
}));

const InboxThreads: () => Node = (): Node => {
  const dispatch = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();

  const theme: Theme = useContext(ThemeContext);
  const isOnline: boolean = useSelector((state: AppState) => state.app.networkState?.isConnected);

  const [selectedEntity, updateSelectedEntity] = useState({
    entity: null,
    navigateToActivity: null,
    commentId: null,
  });

  const [isSplitView, updateIsSplitView] = useState(hasSplitView());
  const dimensionsChangeListener = useRef();

  const loadThreads = useCallback(
    (folderId?: string, end?: number, showProgress?: boolean): void => {
      dispatch(actions.loadInboxThreads(folderId, end, showProgress));
    },
    [dispatch]
  );

  const setThreadsFromCache = useCallback(
    (folderId?: string): void => {dispatch(actions.loadThreadsFromCache(folderId));},
    [dispatch]
  );

  const getLastIndex = (): number => actions.lastVisitedTabIndex() || 0;

  const [navigationState, updateNavigationState] = useState({
    index: getLastIndex(),
    routes,
  });

  const isArticle = (entity: ThreadEntity): boolean => hasType.article(entity);

  useEffect(() => {
    setThreadsFromCache(folderIdMap[getLastIndex()]);
    dimensionsChangeListener.current = Dimensions.addEventListener('change', () => {
      updateIsSplitView(hasSplitView());
    });
    return () => dimensionsChangeListener.current?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const renderTabBar = (props: any) => {
    const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
    return (
      <TabBar
        {...props}
        pressColor={uiThemeColors.$disabled}
        indicatorStyle={{backgroundColor: uiThemeColors.$link}}
        style={[tabStyles.tabsBar, {shadowColor: uiThemeColors.$separator}]}
        tabStyle={tabStyles.tabsBarFluid}
        renderLabel={({route, focused}: { route: TabRoute, focused: boolean }) => (
          <InboxThreadsTabBar route={route} focused={focused} index={navigationState.index}/>
        )}
        scrollEnabled={true}
      />
    );
  };

  const renderEntity = useCallback(
    () => {
      if (!selectedEntity?.entity) {
        return <NothingSelectedIconWithText text={i18n('Select an issue, article or change from the list')}/>;
      }
      const entityProps = {
        ...(isArticle(selectedEntity.entity)
          ? {articlePlaceholder: selectedEntity.entity}
          : {issuePlaceholder: selectedEntity.entity}),
        navigateToActivity: selectedEntity.navigateToActivity,
        commentId: selectedEntity.commentId,
      };
      return isArticle ? <Article {...entityProps}/> : <Issue {...entityProps}/>;
    },
    [selectedEntity.commentId, selectedEntity.entity, selectedEntity.navigateToActivity]
  );

  const onNavigate = useCallback(
    (entity, navigateToActivity, commentId) => {
      if (hasSplitView()) {
        updateSelectedEntity({entity, navigateToActivity, commentId});
      } else {
        (isArticle(entity) ? Router.Article : Router.Issue)({
          navigateToActivity,
          commentId,
          ...(isArticle(entity) ? {articlePlaceholder: entity} : {issueId: entity.id}),
        });
      }
    },
    []
  );

  const AllTab = useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[0]}/>,
    [onNavigate]
  );
  const MentionsAndReactionsTab = useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[1]}/>,
    [onNavigate]
  );
  const SubscriptionsTab = useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[2]}/>,
    [onNavigate]
  );


  const renderTabs = () => {
    return (
      <TabView
        lazy={true}
        renderLazyPlaceholder={() => <InboxThreadsProgressPlaceholder/>}
        swipeEnabled={true}
        navigationState={navigationState}
        renderScene={SceneMap({
          [0]: AllTab,
          [1]: MentionsAndReactionsTab,
          [2]: SubscriptionsTab,
        })}
        initialLayout={{
          height: 0,
          width: Dimensions.get('window').width,
        }}
        renderTabBar={renderTabBar}
        onIndexChange={(index: number) => {
          setThreadsFromCache(folderIdMap[index]);
          updateNavigationState({index, routes});
          actions.lastVisitedTabIndex(index);
        }}
      />
    );
  };

  const renderHeader = () => (
    <Header
      title={i18n('Notifications')}
      rightButton={<TouchableOpacity
        disabled={!isOnline}
        testID="test:id/inboxSettings"
        accessibilityLabel="inboxSettings"
        accessible={true}
        onPress={() => {
          const options = [
            {
              title: actions.isUnreadOnly() ? i18n('Show all') : i18n('Unread only'),
              execute: async () => {
                await actions.toggleUnreadOnly();
                loadThreads(folderIdMap[navigationState.index], undefined, true);
              },
            },
            {
              title: i18n('Mark all as read'),
              execute: () => dispatch(markAllAsRead()),
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
          color={isOnline ? styles.link.color : styles.disabled.color}
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
