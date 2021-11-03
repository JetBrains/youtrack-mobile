/* @flow */

import React, {Component} from 'react';
import {UIManager} from 'react-native';

import {Provider} from 'react-redux';

import AgileBoard from './views/agile-board/agile-board';
import AppProvider from './app-provider';
import Article from './views/article/article';
import ArticleCreate from './views/article-create/article-create';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import CreateIssue from './views/create-issue/create-issue';
import EnterServer from './views/enter-server/enter-server';
import Home from './views/home/home';
import Inbox from './views/inbox/inbox';
import Issue from './views/issue/issue';
import Issues from './views/issues/issues';
import KnowledgeBase from './views/knowledge-base/knowledge-base';
import LoginForm from './views/log-in/log-in';
import Page from './views/page/page';
import PreviewFile from './views/preview-file/preview-file';
import notificationsHelper from './components/push-notifications/push-notifications-helper';
import Router from './components/router/router';
import Settings from './views/settings/settings';
import store from './store';
import WikiPage from './views/wiki-page/wiki-page';
import {ActionSheetProvider, connectActionSheet} from '@expo/react-native-action-sheet';
import {Notifications} from 'react-native-notifications';
import {onNavigateBack, setAccount} from './actions/app-actions';
import {rootRoutesList, routeMap} from './app-routes';

import type {Node} from 'React';
import type {NotificationRouteData} from './flow/Notification';
import type {Ref} from 'react';
import log from './components/log/log';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  }

  static async getNotificationData(): Promise<NotificationRouteData> {
    const notification: Promise<typeof Notification | ?PushNotificationIOS> = await Notifications.getInitialNotification();
    log.info(`Initial notification(on start app):: ${JSON.stringify(notification)}`);
    return {
      issueId: notificationsHelper.getIssueId(notification),
      backendUrl: notificationsHelper.getBackendUrl(notification),
      navigateToActivity: !notificationsHelper.isSummaryOrDescriptionNotification(notification),
    };
  }

  static async init(getNotificationRouteData: () => Promise<?NotificationRouteData>) {
    let notificationRouteData: ?NotificationRouteData;
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
        message: 'Loading configuration...',
        onChangeBackendUrl: oldUrl => Router.EnterServer({serverUrl: oldUrl}),
        onRetry: YouTrackMobile.init,
      },
    });

    Router.registerRoute({
      name: routeMap.EnterServer,
      component: EnterServer,
      type: 'reset',
    });

    Router.registerRoute({
      name: routeMap.LogIn,
      component: LoginForm,
      type: 'reset',
    });

    Router.registerRoute({
      name: routeMap.Issues,
      component: Issues,
      type: 'reset',
    });

    Router.registerRoute({name: routeMap.AgileBoard, component: AgileBoard, type: 'reset'});
    Router.registerRoute({name: routeMap.Article, component: Article});
    Router.registerRoute({name: routeMap.ArticleSingle, component: Article, type: 'reset'});
    Router.registerRoute({name: routeMap.ArticleCreate, component: ArticleCreate, modal: true});
    Router.registerRoute({name: routeMap.AttachmentPreview, component: AttachmentPreview, modal: true});
    Router.registerRoute({name: routeMap.CreateIssue, component: CreateIssue, modal: true});
    Router.registerRoute({name: routeMap.PreviewFile, component: PreviewFile, modal: true});
    Router.registerRoute({name: routeMap.Inbox, component: Inbox, type: 'reset'});
    Router.registerRoute({name: routeMap.Issue, component: Issue});
    Router.registerRoute({name: routeMap.KnowledgeBase, component: KnowledgeBase, type: 'reset'});
    Router.registerRoute({name: routeMap.Page, component: Page});
    Router.registerRoute({name: routeMap.PageModal, component: Page, modal: true});
    Router.registerRoute({name: routeMap.Settings, component: Settings, type: 'reset'});
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
  static childContextTypes: any | {actionSheet: typeof Function} = {
    actionSheet: Function,
  };

  actionSheetRef: Ref<typeof ActionSheetProvider>;

  getChildContext(): { actionSheet: () => Ref<any> } {
    return {
      actionSheet: () => this.actionSheetRef,
    };
  }

  setActionSheetRef: (component: Ref<empty>) => void = (component: Ref<typeof ActionSheetProvider>) => {
    if (component) {
      this.actionSheetRef = component;
    }
  };

  render(): Node {
    return (
      //$FlowFixMe
      <ActionSheetProvider ref={this.setActionSheetRef} useModal={true}>
        <AppActionSheetConnected/>
      </ActionSheetProvider>
    );
  }
}

module.exports = AppContainer;
