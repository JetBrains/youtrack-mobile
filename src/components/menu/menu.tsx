import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, View, EventSubscription} from 'react-native';

import * as Progress from 'react-native-progress';
import {View as AnimatedView} from 'react-native-animatable';
import {useDispatch, useSelector} from 'react-redux';

import IconHelpdesk from 'components/icon/assets/menu_helpdesk.svg';
import IconIssues from 'components/icon/assets/menu_issue.svg';
import IconAgile from 'components/icon/assets/menu_agile.svg';
import IconNotifications from 'components/icon/assets/menu_notification.svg';
import IconKnowledgeBase from 'components/icon/assets/menu_kb.svg';
import IconSettings from 'components/icon/assets/settings.svg';
import Router from 'components/router/router';
import useIsReporter from 'components/user/useIsReporter';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {folderIdMap} from 'views/inbox-threads/inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {IconCircle} from 'components/icon/icon';
import {InboxFolder} from 'types/Inbox';
import {inboxCheckUpdateStatus} from 'actions/app-actions';
import {isSplitView} from 'components/responsive/responsive-helper';
import {MenuItem} from './menu__item';
import {routeMap} from 'app-routes';

import styles from './menu.styles';

import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {RootState} from 'reducers/app-reducer';

export const menuPollInboxStatusDelay: number = 60 * 1000;

type Routes = {
  prevRouteName: string | null;
  currentRouteName: string | null;
};

export default function Menu() {
  const dispatch: ReduxThunkDispatch = useDispatch();

  const isHelpdeskFeatureEnabled: boolean = checkVersion(FEATURE_VERSION.helpDesk);

  const isReporter = useIsReporter();

  const isHelpdeskEnabled = useSelector((state: AppState) => {
    const appState: RootState = state.app;
    if (!isHelpdeskFeatureEnabled || !appState.globalSettings.helpdeskEnabled) {
      return false;
    }
    if (!isReporter) {
      return !appState.helpdeskMenuHidden && appState.user?.profiles?.helpdesk?.helpdeskFolder;
    }
    return true;
  });

  const interval = useRef<ReturnType<typeof setInterval>>();

  const isInboxEnabled: boolean = checkVersion(FEATURE_VERSION.inbox);

  const isInboxThreadsEnabled: boolean = checkVersion(FEATURE_VERSION.inboxThreads);

  const isKBEnabled: boolean = checkVersion(FEATURE_VERSION.knowledgeBase);

  const isKBAccessible: boolean = useSelector((state: AppState) => {
    return isKBEnabled && state.app.issuePermissions.articleReadAccess();
  });

  const hasNewNotifications: boolean = useSelector((appState: AppState) => {
    if (!isInboxThreadsEnabled || isReporter) {
      return false;
    }
    const inboxFolders: InboxFolder[] =
      appState.app.inboxThreadsFolders.filter(it => it?.id === folderIdMap[1] || it?.id === folderIdMap[2]) || [];
    return inboxFolders.length > 0 && inboxFolders.some(it => it?.lastNotified > it?.lastSeen);
  });

  const isChangingAccount: boolean = useSelector((appState: AppState) => appState.app.isChangingAccount);

  const isInProgress: boolean = useSelector((appState: AppState) => !!appState.app.isInProgress);

  const setInboxHasUpdateStatus = useCallback(() => {
    dispatch(inboxCheckUpdateStatus());
  }, [dispatch]);

  const [routes, updateRoutes] = useState<Routes>({
    prevRouteName: null,
    currentRouteName: null,
  });

  const [splitView, updateSplitView] = useState(isSplitView());

  useEffect(() => {
    if (!isInboxThreadsEnabled || isReporter) {
      return;
    }
    const unsubscribe = () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = undefined;
      }
    };

    if (!isChangingAccount) {
      unsubscribe();
      interval.current = setInterval(setInboxHasUpdateStatus, menuPollInboxStatusDelay);
      setInboxHasUpdateStatus();
    }

    return unsubscribe;
  }, [isInboxThreadsEnabled, setInboxHasUpdateStatus, isChangingAccount, isReporter]);

  useEffect(() => {
    const unsubscribeOnDispatch = Router.setOnDispatchCallback(
      (routeName: string | null, prevRouteName: string | null) => {
        updateRoutes({
          currentRouteName: routeName,
          prevRouteName: prevRouteName,
        });
      },
    );
    return () => unsubscribeOnDispatch();
  }, []);

  useEffect(() => {
    const unsubscribeOnDimensionsChange: EventSubscription = Dimensions.addEventListener('change', () =>
      updateSplitView(isSplitView())
    );
    return () => unsubscribeOnDimensionsChange.remove();
  }, [setInboxHasUpdateStatus]);

  const isActiveRoute = (routeName: string) => {
    if (routes.currentRouteName === routeMap.Issue) {
      return routes.prevRouteName === routeName;
    }

    if (routes.currentRouteName === routeMap.HelpDeskFeedback) {
      return routes.prevRouteName === routeName;
    }

    if (routes.currentRouteName === routeMap.Article) {
      return (
        routes.prevRouteName === routeName ||
        (routes.prevRouteName === routeMap.Page && routeMap.KnowledgeBase === routeName)
      );
    }

    if (routes.currentRouteName === routeMap.ArticleSingle) {
      return routeMap.KnowledgeBase === routeName;
    }

    if (routes.currentRouteName === routeMap.ArticleCreate) {
      return routeMap.KnowledgeBase === routeName;
    }

    if (routes.currentRouteName === routeMap.Page) {
      return (
        routeMap.KnowledgeBase === routeName &&
        (routes.prevRouteName === routeMap.Article ||
          routes.prevRouteName === routeMap.KnowledgeBase ||
          routes.prevRouteName === routeMap.PageModal)
      );
    }

    if (routes.currentRouteName === routeMap.PageModal) {
      return (
        routeMap.KnowledgeBase === routeName &&
        (routes.prevRouteName === routeMap.Article || routes.prevRouteName === routeMap.Page)
      );
    }

    return routes.currentRouteName === routeName;
  };

  const canNavigateTo = (routeName: string) => {
    if (isChangingAccount) {
      return false;
    }

    if (
      routes.currentRouteName === routeMap.Issue ||
      routes.currentRouteName === routeMap.Page ||
      routes.currentRouteName === routeMap.Article ||
      routes.currentRouteName === routeMap.ArticleSingle ||
      routes.currentRouteName === routeMap.HelpDeskFeedback
    ) {
      return true;
    }

    return !isActiveRoute(routeName);
  };

  const openIssueList = () => {
    if (canNavigateTo(routeMap.Issues)) {
      Router.Issues();
    }
  };

  const openAgileBoard = () => {
    if (canNavigateTo(routeMap.AgileBoard)) {
      Router.AgileBoard();
    }
  };

  const openInbox = () => {
    const routeName: string = isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox;

    if (canNavigateTo(routeName) && Router[routeName]) {
      Router[routeName]();
    }
  };

  const openSettings = () => {
    if (canNavigateTo(routeMap.Settings)) {
      Router.Settings();
    }
  };

  const openTickets = () => {
    if (canNavigateTo(routeMap.Tickets)) {
      Router.Tickets();
    }
  };

  const openKnowledgeBase = () => {
    const isNotArticleView: boolean =
      routes.currentRouteName !== routeMap.ArticleSingle && routes.currentRouteName !== routeMap.Article;

    if (canNavigateTo(routeMap.KnowledgeBase)) {
      const articleLastVisited = getStorageState().articleLastVisited;
      const article: Article | null = articleLastVisited?.article || null;

      if (article && isNotArticleView && !splitView) {
        Router.ArticleSingle({
          articlePlaceholder: article,
        });
      } else {
        Router.KnowledgeBase(
          splitView
            ? {
                lastVisitedArticle: article,
              }
            : undefined,
        );
      }
    }
  };

  const color = (routeName: string) => {
    return isChangingAccount ? styles.disabled.color : isActiveRoute(routeName) ? styles.link.color : styles.icon.color;
  };

  return (
    <AnimatedView useNativeDriver duration={300} animation="fadeIn" testID="menu">
      <View style={styles.menuProgressContainer}>
        <Progress.Bar
          animated={true}
          indeterminate={true}
          indeterminateAnimationDuration={1000}
          useNativeDriver={true}
          color={isInProgress ? styles.link.color : 'transparent'}
          borderWidth={0}
          unfilledColor={isInProgress ? styles.linkLight.color : 'transparent'}
          width={null}
          height={3}
          borderRadius={0}
        />
      </View>
      <View style={styles.menu}>
        <MenuItem
          notAllowed={isReporter}
          testID="test:id/menuIssues"
          icon={
            <IconIssues
              testID="test:id/menuIssuesIcon"
              // @ts-ignore - for testing purposes
              isActive={isActiveRoute(routeMap.Issues)}
              width={24}
              height={24}
              color={color(routeMap.Issues)}
            />
          }
          onPress={openIssueList}
        />

        <MenuItem
          notAllowed={!isHelpdeskFeatureEnabled || !isHelpdeskEnabled}
          testID="test:id/menuTickets"
          icon={<IconHelpdesk width={24} height={24} color={color(routeMap.Tickets)} />}
          onPress={openTickets}
        />

        <MenuItem
          notAllowed={isReporter}
          testID="test:id/menuAgile"
          icon={<IconAgile width={22} height={22} color={color(routeMap.AgileBoard)} />}
          onPress={openAgileBoard}
        />

        <MenuItem
          notAllowed={!isInboxEnabled && !isInboxThreadsEnabled || isReporter}
          testID="test:id/menuNotifications"
          icon={
            <View>
              <IconNotifications
                width={23}
                height={23}
                color={color(isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox)}
              />
              {isInboxThreadsEnabled &&
                hasNewNotifications &&
                !isActiveRoute(isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox) && (
                  <AnimatedView useNativeDriver duration={1000} animation="fadeIn" style={styles.circleIcon}>
                    <IconCircle size={8} color={styles.link.color} />
                  </AnimatedView>
                )}
            </View>
          }
          onPress={openInbox}
        />

        <MenuItem
          notAllowed={!isKBAccessible}
          testID="test:id/menuKnowledgeBase"
          icon={<IconKnowledgeBase width={25} height={25} color={color(routeMap.KnowledgeBase)} />}
          onPress={openKnowledgeBase}
        />

        <MenuItem
          testID="test:id/menuSettings"
          icon={<IconSettings width={23} height={23} color={color(routeMap.Settings)} />}
          onPress={openSettings}
        />
      </View>
    </AnimatedView>
  );
}
