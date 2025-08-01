import React, {Component} from 'react';
import {UIManager} from 'react-native';

import Toast from 'react-native-easy-toast';
import {ActionSheetProvider, connectActionSheet} from '@expo/react-native-action-sheet';
import {Notifications, Notification} from 'react-native-notifications';
import {Provider} from 'react-redux';

import AgileBoard from 'views/agile-board/agile-board';
import AppProvider from './app-provider';
import Article from 'views/article/article';
import ArticleCreate from 'views/article-create/article-create';
import AttachmentPreview from 'views/attachment-preview/attachment-preview';
import CreateIssue from 'views/create-issue/create-issue';
import EnterServer from 'views/enter-server/enter-server';
import HelpDeskFeedback from 'views/helpdesk-feedback/helpdesk-feedback';
import Home from 'views/home/home';
import Inbox from 'views/inbox/inbox';
import InboxThreads from 'views/inbox-threads/inbox-threads';
import Issue from 'views/issue/issue';
import Issues from 'views/issues/issues';
import KnowledgeBase from 'views/knowledge-base/knowledge-base';
import log from 'components/log/log';
import LoginForm from 'views/log-in/log-in';
import notificationsHelper from 'components/push-notifications/push-notifications-helper';
import Page from 'views/page/page';
import PreviewFile from 'views/preview-file/preview-file';
import Router from 'components/router/router';
import Settings from 'views/settings/settings';
import store from './store';
import Tickets from 'views/tickets/tickets';
import WikiPage from 'views/wiki-page/wiki-page';
import {BottomSheetProvider} from 'components/bottom-sheet';
import {onNavigateBack, setAccount} from 'actions/app-actions';
import {rootRoutesList, routeMap} from 'app-routes';
import {setNotificationComponent} from 'components/notification/notification';

import type {ActionSheetProps} from '@expo/react-native-action-sheet';
import type {ActionSheetProviderRef} from '@expo/react-native-action-sheet';
import type {NavigationNavigateActionPayload} from 'react-navigation';
import type {NotificationRouteData} from 'types/Notification';
import type {ReduxThunkDispatch} from 'types/Redux';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

class YouTrackMobile extends Component<ActionSheetProps, {}> {
  routeHomeName = 'Home';

  constructor(p: ActionSheetProps) {
    super(p);
    this.registerRoutes();
    YouTrackMobile.init(YouTrackMobile.getNotificationData);

    Router.onBack = (closingView: NavigationNavigateActionPayload) => {
      store.dispatch(onNavigateBack(closingView));
    };

    Router.rootRoutes = rootRoutesList;
  }

  static async getNotificationData(): Promise<NotificationRouteData> {
    const notification: Notification | undefined = await Notifications.getInitialNotification();
    if (notification) {
      log.info(`App Actions: Initial notification on app start detected`);
    }
    return notificationsHelper.getNotificationRouteData(notification);
  }

  static async init(getNotificationRouteData: () => Promise<NotificationRouteData | null>) {
    let notificationRouteData: NotificationRouteData | null = null;

    if (getNotificationRouteData) {
      notificationRouteData = await getNotificationRouteData();
    }

    const dispatch: ReduxThunkDispatch = store.dispatch;
    dispatch(setAccount(notificationRouteData));
  }

  registerRoutes() {
    Router.registerRoute({
      name: this.routeHomeName,
      component: Home,
      type: 'reset',
      props: {
        message: 'Loading configuration...',
        onChangeBackendUrl: (url: string) => Router.EnterServer({serverUrl: url}),
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
    Router.registerRoute({
      name: routeMap.AgileBoard,
      component: AgileBoard,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.Article,
      component: Article,
    });
    Router.registerRoute({
      name: routeMap.ArticleSingle,
      component: Article,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.ArticleCreate,
      component: ArticleCreate,
      modal: true,
    });
    Router.registerRoute({
      name: routeMap.AttachmentPreview,
      component: AttachmentPreview,
      modal: true,
    });
    Router.registerRoute({
      name: routeMap.CreateIssue,
      component: CreateIssue,
    });
    Router.registerRoute({
      name: routeMap.PreviewFile,
      component: PreviewFile,
      modal: true,
    });
    Router.registerRoute({
      name: routeMap.Inbox,
      component: Inbox,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.InboxThreads,
      component: InboxThreads,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.Issue,
      component: Issue,
      tabletComponentName: routeMap.Issues,
    });
    Router.registerRoute({
      name: routeMap.KnowledgeBase,
      component: KnowledgeBase,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.Page,
      component: Page,
    });
    Router.registerRoute({
      name: routeMap.PageModal,
      component: Page,
      modal: true,
    });
    Router.registerRoute({
      name: routeMap.Settings,
      component: Settings,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.WikiPage,
      component: WikiPage,
      modal: true,
    });
    Router.registerRoute({
      name: routeMap.Tickets,
      component: Tickets,
      type: 'reset',
    });
    Router.registerRoute({
      name: routeMap.HelpDeskFeedback,
      component: HelpDeskFeedback,
    });
    Router.finalizeRoutes(this.routeHomeName);
  }

  render() {
    return <AppProvider />;
  }
}

const AppActionSheetConnected = connectActionSheet(YouTrackMobile);

class AppContainer extends Component<void, void> {
  static childContextTypes: any = {
    actionSheet: Function,
  };
  private actionSheetRef: ActionSheetProviderRef | null = null;

  getChildContext(): { actionSheet: () => ActionSheetProviderRef | null; } {
    return {
      actionSheet: () => this.actionSheetRef,
    };
  }

  setActionSheetRef = (component: ActionSheetProviderRef) => {
    if (component) {
      this.actionSheetRef = component;
    }
  };

  render() {
    return (
      <Provider store={store}>
        <BottomSheetProvider>
          <>
            <ActionSheetProvider ref={this.setActionSheetRef} useModal={true}>
              <AppActionSheetConnected/>
            </ActionSheetProvider>
            <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>
          </>
        </BottomSheetProvider>
      </Provider>
    );
  }
}

module.exports = AppContainer;
