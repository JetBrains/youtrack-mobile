/* @flow */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, View} from 'react-native';

import * as Progress from 'react-native-progress';
import {View as AnimatedView} from 'react-native-animatable';
import {useDispatch, useSelector} from 'react-redux';

import Router from '../router/router';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {folderIdMap} from 'views/inbox-threads/inbox-threads-helper';
import {getStorageState} from 'components/storage/storage';
import {IconBell, IconBoard, IconSettings, IconTask, IconKnowledgeBase, IconCircle} from 'components/icon/icon';
import {InboxFolder} from 'flow/Inbox';
import {inboxCheckUpdateStatus} from '../../actions/app-actions';
import {isSplitView} from 'components/responsive/responsive-helper';
import {MenuItem} from './menu__item';
import {routeMap} from '../../app-routes';

import styles from './menu.styles';

import type {AppState} from '../../reducers';
import type {Article} from 'flow/Article';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventSubscription';

export const menuPollInboxStatusDelay: number = 60 * 1000;


export default function () {
  const dispatch = useDispatch();
  const interval = useRef();

  const isInboxEnabled: boolean = checkVersion(FEATURE_VERSION.inbox);
  const isInboxThreadsEnabled: boolean = checkVersion(FEATURE_VERSION.inboxThreads);
  const isKBEnabled: boolean = checkVersion(FEATURE_VERSION.knowledgeBase);

  const hasNewNotifications: boolean = useSelector((appState: AppState) => {
    if (!isInboxThreadsEnabled) {
      return false;
    }
    const inboxFolders: InboxFolder[] = appState.app.inboxThreadsFolders.filter(
      (it) => it?.id === folderIdMap[1] || it?.id === folderIdMap[2]
    ) || [];
    return inboxFolders.length > 0 && inboxFolders.some(it => it?.lastNotified > it?.lastSeen);
  });
  const isChangingAccount: boolean = useSelector((appState: AppState) => appState.app.isChangingAccount);
  const isInProgress: boolean = useSelector((appState: AppState) => appState.app.isInProgress);
  const setInboxHasUpdateStatus = useCallback(
    () => {
      dispatch(inboxCheckUpdateStatus());
    },
    [dispatch]
  );

  const [routes, updateRoutes] = useState({
    prevRouteName: null,
    currentRouteName: null,
  });
  const [splitView, updateSplitView] = useState(isSplitView());


  useEffect(() => {
    const unsubscribe = () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
    if (isInboxThreadsEnabled && !isChangingAccount) {
      unsubscribe();
      interval.current = setInterval(setInboxHasUpdateStatus, menuPollInboxStatusDelay);
      setInboxHasUpdateStatus();
    }
    return unsubscribe;

  }, [isInboxThreadsEnabled, setInboxHasUpdateStatus, isChangingAccount]);


  useEffect(() => {
    const unsubscribeOnDispatch = Router.setOnDispatchCallback((routeName: ?string, prevRouteName: ?string) => {
      updateRoutes({
        currentRouteName: routeName,
        prevRouteName: prevRouteName,
      });
    });
    return () => unsubscribeOnDispatch();
  }, []);

  useEffect(() => {
    const unsubscribeOnDimensionsChange: EventSubscription = Dimensions.addEventListener(
      'change', () => updateSplitView(isSplitView()));
    return () => unsubscribeOnDimensionsChange.remove();
  }, [setInboxHasUpdateStatus]);

  const isActiveRoute = (routeName: string) => {
    if (routes.currentRouteName === routeMap.Issue) {
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
      return routeMap.KnowledgeBase === routeName && (
        routes.prevRouteName === routeMap.Article ||
        routes.prevRouteName === routeMap.KnowledgeBase ||
        routes.prevRouteName === routeMap.PageModal
      );
    }

    if (routes.currentRouteName === routeMap.PageModal) {
      return routeMap.KnowledgeBase === routeName && (
        routes.prevRouteName === routeMap.Article ||
        routes.prevRouteName === routeMap.Page
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
      routes.currentRouteName === routeMap.ArticleSingle
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

  const openKnowledgeBase = () => {
    const isNotArticleView: boolean = (
      routes.currentRouteName !== routeMap.ArticleSingle &&
      routes.currentRouteName !== routeMap.Article
    );
    if (canNavigateTo(routeMap.KnowledgeBase)) {
      const articleLastVisited = getStorageState().articleLastVisited;
      const article: ?Article = articleLastVisited && articleLastVisited.article;
      if (article && isNotArticleView && !splitView) {
        Router.ArticleSingle({articlePlaceholder: article});
      } else {
        Router.KnowledgeBase(splitView ? {lastVisitedArticle: article} : undefined);
      }
    }
  };

  const color = (routeName: string) => {
    return (
      isChangingAccount
        ? styles.disabled.color
        : isActiveRoute(routeName) ? styles.link.color : styles.icon.color
    );
  };

  return (
    <AnimatedView
      useNativeDriver
      duration={300}
      animation="fadeIn"
      testID="menu"
    >
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
          testID="test:id/menuIssues"
          icon={<IconTask
            testID="menuIssuesIcon"
            isActive={isActiveRoute(routeMap.Issues)}
            size={23}
            color={color(routeMap.Issues)}
          />}
          onPress={openIssueList}
        />

        <MenuItem
          testID="test:id/menuAgile"
          icon={<IconBoard size={28} color={color(routeMap.AgileBoard)}/>}
          onPress={openAgileBoard}
        />

        <MenuItem
          disabled={!isInboxEnabled && !isInboxThreadsEnabled}
          testID="test:id/menuNotifications"
          icon={
            <View>
              {isInboxThreadsEnabled && hasNewNotifications && !isActiveRoute(isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox) && (
                <AnimatedView
                  useNativeDriver
                  duration={1000}
                  animation="fadeIn"
                  style={styles.circleIcon}
                >
                  <IconCircle size={10} color={styles.link.color}/>
                </AnimatedView>
              )}
              <IconBell size={22} color={color(isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox)}/>
            </View>
          }
          onPress={openInbox}
        />

        <MenuItem
          disabled={!isKBEnabled}
          testID="test:id/menuKnowledgeBase"
          icon={<IconKnowledgeBase size={22} color={color(routeMap.KnowledgeBase)}/>}
          onPress={openKnowledgeBase}
        />

        <MenuItem
          testID="test:id/menuSettings"
          icon={<IconSettings size={21} color={color(routeMap.Settings)}/>}
          onPress={openSettings}
        />
      </View>

    </AnimatedView>
  );
}
