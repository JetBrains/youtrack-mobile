/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';
import {useDispatch, useSelector} from 'react-redux';

import Router from '../router/router';
import useInterval from 'components/hooks/use-interval';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {getStorageState} from 'components/storage/storage';
import {IconBell, IconBoard, IconSettings, IconTask, IconKnowledgeBase, IconCircle} from 'components/icon/icon';
import {inboxSetUpdateStatus} from '../../actions/app-actions';
import {isSplitView} from 'components/responsive/responsive-helper';
import {MenuItem} from './menu__item';
import {routeMap} from '../../app-routes';

import styles from './menu.styles';

import type {AppState} from '../../reducers';
import type {Article} from 'flow/Article';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventSubscription';

const defaultStatusDelay: number = 60 * 1000;


export default function () {
  const dispatch = useDispatch();
  const isInboxThreadsEnabled: boolean = checkVersion(FEATURE_VERSION.inboxThreads, true);

  const hasInboxUpdate: boolean = useSelector((appState: AppState) => appState.app.inboxThreadsHasUpdate);
  const isDisabled: boolean = useSelector((appState: AppState) => appState.app.isChangingAccount);
  const setInboxHasUpdateStatus = useCallback(
    () => {
      dispatch(inboxSetUpdateStatus());
    },
    [dispatch]
  );

  const [routes, updateRoutes] = useState({
    prevRouteName: null,
    currentRouteName: null,
  });
  const [splitView, updateSplitView] = useState(isSplitView());
  const [pollInboxStatusDelay, updatePollInboxStatusDelay] = useState(defaultStatusDelay);


  useInterval(setInboxHasUpdateStatus, pollInboxStatusDelay);

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

  const startPollingInboxUpdateStatus = () => {
    if (pollInboxStatusDelay === null) {
      setInboxHasUpdateStatus();
      updatePollInboxStatusDelay(defaultStatusDelay);
    }
  };

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
    if (isDisabled) {
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
      startPollingInboxUpdateStatus();
    }
  };

  const openAgileBoard = () => {
    if (canNavigateTo(routeMap.AgileBoard)) {
      Router.AgileBoard();
      startPollingInboxUpdateStatus();
    }
  };

  const openInbox = () => {
    const routeName: string = isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox;
    if (canNavigateTo(routeName) && Router[routeName]) {
      Router[routeName]();
      updatePollInboxStatusDelay(null);
    }
  };

  const openSettings = () => {
    if (canNavigateTo(routeMap.Settings)) {
      Router.Settings();
      startPollingInboxUpdateStatus();
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
      startPollingInboxUpdateStatus();
    }
  };

  const isKBEnabled: boolean = checkVersion(FEATURE_VERSION.knowledgeBase, true);
  const isInboxEnabled: boolean = checkVersion(FEATURE_VERSION.inbox, true);
  const color = (routeName: string) => {
    return (
      isDisabled
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
      style={styles.menu}
    >
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
            {isInboxThreadsEnabled && hasInboxUpdate && (
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
        testID="menuKnowledgeBase"
        icon={<IconKnowledgeBase size={22} color={color(routeMap.KnowledgeBase)}/>}
        onPress={openKnowledgeBase}
      />

      <MenuItem
        testID="test:id/menuSettings"
        icon={<IconSettings size={21} color={color(routeMap.Settings)}/>}
        onPress={openSettings}
      />

    </AnimatedView>
  );
}
