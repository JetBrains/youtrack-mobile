/* @flow */

import React, {Component} from 'react';
import {UIManager} from 'react-native';

import PropTypes from 'prop-types';
import {Provider} from 'react-redux';

import Router from './components/router/router';
import store from './store';
import {isAndroidPlatform} from './util/util';
import {onNavigateBack, setAccount} from './actions/app-actions';
import {rootRoutesList, routeMap} from './app-routes';

import AgileBoard from './views/agile-board/agile-board';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import CreateIssue from './views/create-issue/create-issue';
import EnterServer from './views/enter-server/enter-server';
import Home from './views/home/home';
import Image from './views/image/image';
import Inbox from './views/inbox/inbox';
import Issue from './views/issue/issue';
import Issues from './views/issues/issues';
import LoginForm from './views/log-in/log-in';
import Settings from './views/settings/settings';
import WikiPage from './views/wiki-page/wiki-page';


import {ActionSheetProvider, connectActionSheet} from '@expo/react-native-action-sheet';

import AppProvider from './app-provider';

import type {NotificationRouteData} from './flow/Notification';
import type {Ref} from 'react';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isAndroid: boolean = isAndroidPlatform();
/*
  Uncomment this string to debug network request in Chrome. Chrome should be run with --disable-web-security flag.
  Or use React Native Debugger https://github.com/jhen0409/react-native-debugger
  https://github.com/facebook/react-native/issues/934
*/
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

class YouTrackMobile extends Component<void, void> {
  routeHomeName = 'Home';

  constructor() {
    super();

    this.registerRoutes();
    YouTrackMobile.init(YouTrackMobile.getNotificationData);

    Router.onBack = (closingView) => {
      store.dispatch(onNavigateBack(closingView));
    };

    Router.rootRoutes = rootRoutesList;

    YouTrackMobile.initAndroidPushNotification();
  }

  static async initAndroidPushNotification() {
    if (isAndroid) {
      const PushNotificationsProcessor = (await import('./components/push-notifications/push-notifications-processor')).default;
      PushNotificationsProcessor.init();
    }
  }

  static async getNotificationData() {
    let notificationData: NotificationRouteData = {};
    if (isAndroid) {
      const ReactNativeNotifications = await import('react-native-notifications-latest');
      const initialNotification = await ReactNativeNotifications.Notifications.getInitialNotification();
      const notificationPayload = initialNotification?.payload;
      notificationData = {
        issueId: notificationPayload?.issueId,
        backendUrl: notificationPayload?.backendUrl
      };
    }
    return notificationData;
  }

  static async init(getNotificationRouteData: () => Promise<NotificationRouteData>) {
    let notificationRouteData = {};
    if (getNotificationRouteData) {
      notificationRouteData = await getNotificationRouteData();
    }
    store.dispatch(setAccount(notificationRouteData));
  }

  registerRoutes() {
    Router.registerRoute({
      name: this.routeHomeName,
      component: Home,
      type: 'reset',
      props: {
        message: `Loading configuration...`,
        onChangeBackendUrl: oldUrl => Router.EnterServer({serverUrl: oldUrl}),
        onRetry: YouTrackMobile.init
      }
    });

    Router.registerRoute({
      name: routeMap.EnterServer,
      component: EnterServer,
      type: 'reset'
    });

    Router.registerRoute({
      name: routeMap.LogIn,
      component: LoginForm,
      type: 'reset'
    });

    Router.registerRoute({
      name: routeMap.Issues,
      component: Issues,
      type: 'reset'
    });

    Router.registerRoute({name: routeMap.Settings, component: Settings, type: 'reset'});

    Router.registerRoute({name: routeMap.Issue, component: Issue});

    Router.registerRoute({name: routeMap.Image, component: Image, modal: true});

    Router.registerRoute({name: routeMap.AttachmentPreview, component: AttachmentPreview, modal: true});

    Router.registerRoute({name: routeMap.CreateIssue, component: CreateIssue, modal: true});

    Router.registerRoute({name: routeMap.AgileBoard, component: AgileBoard, type: 'reset'});

    Router.registerRoute({name: routeMap.Inbox, component: Inbox, type: 'reset'});

    Router.registerRoute({name: routeMap.WikiPage, component: WikiPage, modal: true});

    Router.finalizeRoutes(this.routeHomeName);
  }

  render() {
    return (
      <Provider store={store}>
        <AppProvider/>
      </Provider>
    );
  }
}

const AppActionSheetConnected = connectActionSheet<{}>(YouTrackMobile);

class AppContainer extends Component<void, void> {
  static childContextTypes = {
    actionSheet: PropTypes.func
  };

  actionSheetRef: Ref<ActionSheetProvider>;

  getChildContext() {
    return {
      actionSheet: () => this.actionSheetRef,
    };
  }

  setActionSheetRef = (component: Ref<ActionSheetProvider>) => {
    if (component) {
      this.actionSheetRef = component;
    }
  };

  render() {
    return (
      //$FlowFixMe
      <ActionSheetProvider ref={this.setActionSheetRef} useModal={true}>
        <AppActionSheetConnected/>
      </ActionSheetProvider>
    );
  }
}

module.exports = AppContainer; //eslint-disable-line import/no-commonjs
