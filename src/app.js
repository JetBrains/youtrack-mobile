/* @flow */

import React, {Component} from 'react';
import {UIManager} from 'react-native';


import PropTypes from 'prop-types';
import store from './store';
import {Provider} from 'react-redux';

import Router from './components/router/router';

import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/single-issue';
import CreateIssue from './views/create-issue/create-issue';
import Image from './views/image/image';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import AgileBoard from './views/agile-board/agile-board';
import Inbox from './views/inbox/inbox';
import WikiPage from './views/wiki-page/wiki-page';
import Settings from './views/settings/settings';

import {setAccount, onNavigateBack} from './actions/app-actions';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there

import ActionSheet from '@expo/react-native-action-sheet';
import {routeMap, rootRoutesList} from './app-routes';
import log from './components/log/log';
import {isAndroidPlatform} from './util/util';

import AppProvider from './app-provider';

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
  static childContextTypes = {
    actionSheet: PropTypes.func
  };
  _actionSheetRef: ?Object;
  routeHomeName = 'Home';

  constructor() {
    super();

    this.registerRoutes();
    YouTrackMobile.init(YouTrackMobile.getNotificationIssueId);

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

  static async getNotificationIssueId() {
    let issueId: string | null = null;
    if (isAndroid) {
      const ReactNativeNotifications = await import('react-native-notifications-latest');
      const initialNotification = await ReactNativeNotifications.Notifications.getInitialNotification();
      issueId = initialNotification?.payload?.issueId;
      if (issueId) {
        log.debug(`app(getNotificationIssueId): start app to view: ${issueId}`);
      }
    }
    return issueId;
  }

  static async init(getRouteIssueId: () => Promise<string | null>) {
    let issueId = null;
    if (getRouteIssueId) {
      issueId = await getRouteIssueId();
    }
    store.dispatch(setAccount(issueId));
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef
    };
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
      name: routeMap.IssueList,
      component: IssueList,
      type: 'reset'
    });

    Router.registerRoute({name: routeMap.Settings, component: Settings, type: 'reset'});

    Router.registerRoute({name: routeMap.SingleIssue, component: SingleIssue});

    Router.registerRoute({name: routeMap.Image, component: Image, modal: true});

    Router.registerRoute({name: routeMap.AttachmentPreview, component: AttachmentPreview, modal: true});

    Router.registerRoute({name: routeMap.CreateIssue, component: CreateIssue, modal: true});

    Router.registerRoute({name: routeMap.AgileBoard, component: AgileBoard, type: 'reset'});

    Router.registerRoute({name: routeMap.Inbox, component: Inbox, type: 'reset'});

    Router.registerRoute({name: routeMap.WikiPage, component: WikiPage, modal: true});

    Router.finalizeRoutes(this.routeHomeName);
  }

  actionSheetRef = (component: ?React$Element<any>) => {
    if (component) {
      this._actionSheetRef = component;
    }
  };

  render() {
    return (
      <Provider store={store}>
        <ActionSheet ref={this.actionSheetRef}>
          <AppProvider/>
        </ActionSheet>
      </Provider>
    );
  }
}

module.exports = YouTrackMobile; //eslint-disable-line import/no-commonjs
