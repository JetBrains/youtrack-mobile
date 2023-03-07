import * as React from 'react';
import {Dimensions, Linking, Text, TouchableOpacity, View} from 'react-native';

import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useDispatch, useSelector} from 'react-redux';

import * as actions from './inbox-threads-actions';
import Article from 'views/article/article';
import InboxThreadsProgressPlaceholder from './inbox-threads__progress-placeholder';
import InboxThreadsList from './inbox-threads__list';
import InboxThreadsTabBar from './inbox-threads__tab-bar';
import InboxThreadsUpdateButton from './inbox-threads__update-button';
import Issue from 'views/issue/issue';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {defaultActionsOptions} from 'components/action-sheet/action-sheet';
import {folderIdMap, getThreadTabsTitles} from './inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconMoreOptions} from 'components/icon/icon';
import {isAndroidPlatform} from 'util/util';
import {isSplitView as hasSplitView} from 'components/responsive/responsive-helper';
import {markAllAsRead} from './inbox-threads-actions';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from 'reducers';
import type {TabRoute} from 'types/Issue';
import type {Theme, UIThemeColors} from 'types/Theme';
import type {ThreadEntity} from 'types/Inbox';
import {AppConfig} from 'types/AppConfig';

const InboxThreads: ()=> React.ReactNode = (): JSX.Element => {
  const segmentTabs: string[] = getThreadTabsTitles().slice(0,2);
  const routes: TabRoute[] = getThreadTabsTitles().map(
    (name: string, index: number) => ({
      key: index,
      title: name,
      id: folderIdMap[index],
    }),
  );

  const dispatch = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();
  const theme: Theme = React.useContext(ThemeContext);
  const dimensionsChangeListener = React.useRef();

  const isnoTabsNotifications: React.MutableRefObject<boolean> = React.useRef(!!getStorageState().noTabsNotifications);
  const isOnline: boolean = useSelector((state: AppState) => !!state.app.networkState?.isConnected);

  const [selectedEntity, updateSelectedEntity] = React.useState({
    entity: null,
    navigateToActivity: null,
    commentId: null,
  });
  const [isSplitView, updateIsSplitView] = React.useState(hasSplitView());

  const loadThreads = React.useCallback(
    (folderId?: string, end?: number | null, showProgress?: boolean): void => {
      dispatch(actions.loadInboxThreads(folderId, end, showProgress));
    },
    [dispatch],
  );
  const setThreadsFromCache = React.useCallback(
    (folderId?: string): void => {
      dispatch(actions.loadThreadsFromCache(folderId));
    },
    [dispatch],
  );

  const getLastIndex = (): number => actions.lastVisitedTabIndex() || 0;

  const [navigationState, updateNavigationState] = React.useState({
    index: getLastIndex(),
    routes,
  });

  const isArticle = (entity: ThreadEntity): boolean => hasType.article(entity);

  React.useEffect(() => {
    usage.trackScreenView(ANALYTICS_NOTIFICATIONS_THREADS_PAGE);
    setThreadsFromCache(folderIdMap[getLastIndex()]);
    dimensionsChangeListener.current = Dimensions.addEventListener(
      'change',
      () => {
        updateIsSplitView(hasSplitView());
      },
    );
    return () => dimensionsChangeListener.current?.remove(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabBar = (props: any) => {
    const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
    return (
      <TabBar
        {...props}
        pressColor={uiThemeColors.$disabled}
        indicatorStyle={{
          backgroundColor: uiThemeColors.$link,
        }}
        style={[
          tabStyles.tabsBar,
          {
            shadowColor: uiThemeColors.$separator,
          },
        ]}
        tabStyle={tabStyles.tabsBarFluid}
        renderLabel={({
          route,
          focused,
        }: {
          route: TabRoute;
          focused: boolean;
        }) => (
          <InboxThreadsTabBar
            route={route}
            focused={focused}
            index={navigationState.index}
          />
        )}
        scrollEnabled={true}
      />
    );
  };

  const renderEntity = () => {
    if (!selectedEntity?.entity) {
      return (
        <NothingSelectedIconWithText
          text={i18n(
            'To view an item in context, select an issue, article, or update from the list',
          )}
        />
      );
    }

    const isNavigateToArticle: boolean = isArticle(selectedEntity.entity);
    const entityProps = {
      ...(isNavigateToArticle
        ? {
          articlePlaceholder: selectedEntity.entity,
        }
        : {
          issuePlaceholder: selectedEntity.entity,
          issueId: selectedEntity.entity?.id,
        }),
      navigateToActivity: selectedEntity.navigateToActivity,
      commentId: selectedEntity.commentId,
    };
    return isNavigateToArticle ? <Article {...entityProps} /> : <Issue {...entityProps} />;
  };

  const onNavigate = React.useCallback((entity, navigateToActivity, commentId) => {
    if (entity) {
      if (hasSplitView()) {
        updateSelectedEntity({
          entity,
          navigateToActivity,
          commentId,
        });
      } else {
        (isArticle(entity) ? Router.Article : Router.Issue)({
          navigateToActivity,
          commentId,
          ...(isArticle(entity) ? {articlePlaceholder: entity} : {issueId: entity.id}),
        });
      }
    }
  }, []);
  const AllTab = React.useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[0]}/>,
    [onNavigate],
  );
  const MentionsAndReactionsTab = React.useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[1]}/>,
    [onNavigate],
  );
  const SubscriptionsTab = React.useCallback(
    () => <InboxThreadsList onNavigate={onNavigate} folderId={folderIdMap[2]}/>,
    [onNavigate],
  );

  const onFolderChange = (index: number): void => {
    setThreadsFromCache(folderIdMap[index]);
    updateNavigationState({index, routes});
    loadThreads(folderIdMap[index], undefined, true);
    actions.lastVisitedTabIndex(index);
  };

  const renderTabs = () => {
    return (
      <TabView
        lazy={true}
        renderLazyPlaceholder={() => <InboxThreadsProgressPlaceholder />}
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
        onIndexChange={onFolderChange}
      />
    );
  };

  const renderHeaderSegmentControl = () => {
    const SegmentedControl = require('@react-native-segmented-control/segmented-control').default;
    return (
      <View style={theme.mode === 'dark' && isAndroidPlatform() && styles.threadSwitcherContainerAndroid}>
        <SegmentedControl
          appearance={theme.mode}
          activeFontStyle={styles.threadSwitcherActiveColor}
          fontStyle={styles.threadSubTitleText}
          style={styles.threadSwitcher}
          values={segmentTabs}
          selectedIndex={navigationState.index}
          onChange={(event: {nativeEvent: {selectedSegmentIndex: number}}) => {
            onFolderChange(event.nativeEvent.selectedSegmentIndex);
          }}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {i18n('Notifications')}
      </Text>

      {isnoTabsNotifications && renderHeaderSegmentControl()}

      <View style={[styles.headerButton, styles.headerRightButton]}>
        <TouchableOpacity
          disabled={!isOnline}
          testID="test:id/inboxSettings"
          accessibilityLabel="inboxSettings"
          accessible={true}
          onPress={() => {
            const options = [
              {
                title: actions.isUnreadOnly()
                  ? i18n('Show all')
                  : i18n('Unread only'),
                execute: async () => {
                  await actions.toggleUnreadOnly();
                  loadThreads(
                    folderIdMap[navigationState.index],
                    undefined,
                    true,
                  );
                },
              },
              {
                title: i18n('Mark all as read'),
                execute: async () => {
                  await dispatch(markAllAsRead(navigationState.index));
                  loadThreads(folderIdMap[navigationState.index], null, true);
                },
              },
              {
                title: i18n('Notification settings…'),
                execute: () =>
                  Linking.openURL(
                    `${
                      (getStorageState().config as AppConfig).backendUrl
                    }/users/me?tab=notifications`,
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
              (index: number) => {
                options[index]?.execute?.();
              },
            );
          }}
          style={styles.threadTitleAction}
        >
          <IconMoreOptions
            size={18}
            color={isOnline ? styles.link.color : styles.disabled.color}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Container = isSplitView ? View : React.Fragment;
  return (
    <View
      testID="test:id/inboxThreads"
      accessibilityLabel="inboxThreads"
      accessible={true}
      style={[styles.container, isSplitView ? styles.splitViewContainer : null]}
    >
      <Container {...(isSplitView ? styles.splitViewSide : {})}>
        {renderHeader()}
        <InboxThreadsUpdateButton index={navigationState.index} />

        {!isnoTabsNotifications.current && renderTabs()}
        {isnoTabsNotifications.current && <>
          {renderHeaderSegmentControl()}
          <InboxThreadsList
            onNavigate={onNavigate}
            folderId={folderIdMap[Math.min(navigationState.index, segmentTabs.length)]}
          />
        </>}
      </Container>

      {isSplitView && (
        <View style={isSplitView && styles.splitViewMain}>
          {renderEntity()}
        </View>
      )}
    </View>
  );
};

export default InboxThreads;
