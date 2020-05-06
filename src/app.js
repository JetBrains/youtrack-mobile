/* @flow */

import {View, UIManager, StyleSheet, Platform} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import store from './store';
import {Provider} from 'react-redux';

import Auth from './components/auth/auth';
import Router from './components/router/router';
import './components/push-notifications/push-notifications';
import DebugView from './components/debug-view/debug-view';
import FeaturesView from './components/feature/features-view';
import ScanView from './components/scan/scan-view';
import UserAgreement from './components/user-agreement/user-agreement';
import {setNotificationComponent} from './components/notification/notification';

import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/single-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import AgileBoard from './views/agile-board/agile-board';
import Inbox from './views/inbox/inbox';
import WikiPage from './views/wiki-page/wiki-page';
import Settings from './views/settings/settings';

import {APP_BACKGROUND} from './components/common-styles/app';
import ErrorBoundary from './components/error-boundary/error-boundary';
import {setAccount, onNavigateBack} from './actions/app-actions';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';

import ActionSheet from '@expo/react-native-action-sheet';
import Menu from './components/menu/menu';
import {routeMap, rootRoutesList} from './app-routes';
import {menuHeight} from './components/common-styles/navigation';
import log from './components/log/log';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isAndroid: boolean = Platform.OS === 'android';
/*
  Uncomment this string to debug network request in Chrome. Chrome should be run with --disable-web-security flag.
  Or use React Native Debugger https://github.com/jhen0409/react-native-debugger
  https://github.com/facebook/react-native/issues/934
*/
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

type State = {
  backgroundColor: string
}

class YouTrackMobile extends Component<void, State> {
  static childContextTypes = {
    actionSheet: PropTypes.func
  };
  auth: Auth;
  _actionSheetRef: ?Object;
  routeHomeName = 'Home';

  constructor() {
    super();

    this.state = {backgroundColor: APP_BACKGROUND};

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
      PushNotificationsProcessor.init((token: string) => {
        PushNotificationsProcessor.setDeviceToken(token);
      }, (error) => {
        log.warn(`Cannot get a device token`, error);
      });
    }
  }

  static async getNotificationIssueId() {
    let issueId: string | null = null;
    if (isAndroid) {
      const ReactNativeNotifications = await import('react-native-notifications-latest');
      const initialNotification = await ReactNativeNotifications.Notifications.getInitialNotification();
      issueId = initialNotification?.payload?.issueId;
      log.debug(`app(getNotificationIssueId): found initial notification with issueId: ${issueId}`);
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

    Router.registerRoute({name: routeMap.Settings, component: Settings});

    Router.registerRoute({name: routeMap.SingleIssue, component: SingleIssue});

    Router.registerRoute({name: routeMap.ShowImage, component: ShowImage, modal: true});

    Router.registerRoute({name: routeMap.AttachmentPreview, component: AttachmentPreview, modal: true});

    Router.registerRoute({name: routeMap.CreateIssue, component: CreateIssue});

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
          <SafeAreaView style={[Styles.flexBox, {backgroundColor: this.state.backgroundColor}]}>
            <ErrorBoundary>
              <View style={Styles.flexBox}>

                <View style={Styles.view}>
                  {Router.renderNavigatorView()}
                </View>

                <View style={Styles.navigation}>
                  <Menu/>
                </View>

              </View>

              <UserAgreement/>
              <DebugView/>
              <FeaturesView/>
              <ScanView/>
            </ErrorBoundary>

            <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>

          </SafeAreaView>
        </ActionSheet>
      </Provider>
    );
  }
}

module.exports = YouTrackMobile; //eslint-disable-line import/no-commonjs

const Styles = StyleSheet.create({
  flexBox: {
    flex: 1
  },
  view: {
    flexGrow: 1
  },
  navigation: {
    height: menuHeight
  }
});
