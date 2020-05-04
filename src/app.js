/* @flow */

import {View, UIManager, StyleSheet} from 'react-native';
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

import {COLOR_BLACK, COLOR_FONT_ON_BLACK} from './components/variables/variables';
import ErrorBoundary from './components/error-boundary/error-boundary';
import {getStoredConfigAndProceed, onNavigateBack} from './actions/app-actions';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';

import ActionSheet from '@expo/react-native-action-sheet';
import PushNotificationsProcessor from './components/push-notifications/push-notifications-processor';
import log from './components/log/log';
import {Notifications} from 'react-native-notifications-latest';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
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

    this.state = {backgroundColor: COLOR_FONT_ON_BLACK};

    this.registerRoutes();
    YouTrackMobile.init(YouTrackMobile.getNotificationIssueId);

    Router.onBack = (closingView) => {
      store.dispatch(onNavigateBack(closingView));
    };
    Router.setOnDispatchCallback((routeName: ?string) => {
      const isHomeRoute: boolean = Boolean(routeName && routeName === this.routeHomeName);
      this.setState({backgroundColor: isHomeRoute ? COLOR_FONT_ON_BLACK : COLOR_BLACK});
    });

    Router.rootRoutes = ['IssueList', 'Inbox', 'AgileBoard'];

    PushNotificationsProcessor.init((token: string) => {
      PushNotificationsProcessor.setDeviceToken(token);
    }, (error) => {
      log.warn(`Cannot get a device token`, error);
    });
  }

  static async getNotificationIssueId() {
    const notification = await Notifications.getInitialNotification();
    const issueId = notification?.payload?.issueId;
    log.debug(`app(getNotificationIssueId): found initial notification with issueId: ${issueId}`);
    return issueId;
  }

  static async init(getRouteIssueId: () => Promise<string>) {
    let issueId = null;
    if (getRouteIssueId) {
      issueId = await getRouteIssueId();
    }
    store.dispatch(getStoredConfigAndProceed(issueId));
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
      name: 'EnterServer',
      component: EnterServer,
      type: 'reset'
    });

    Router.registerRoute({
      name: 'LogIn',
      component: LoginForm,
      type: 'reset'
    });

    Router.registerRoute({
      name: 'IssueList',
      component: IssueList,
      type: 'reset'
    });

    Router.registerRoute({name: 'SingleIssue', component: SingleIssue});

    Router.registerRoute({name: 'ShowImage', component: ShowImage, modal: true});

    Router.registerRoute({name: 'AttachmentPreview', component: AttachmentPreview, modal: true});

    Router.registerRoute({name: 'CreateIssue', component: CreateIssue});

    Router.registerRoute({name: 'AgileBoard', component: AgileBoard, type: 'reset'});

    Router.registerRoute({name: 'Inbox', component: Inbox, type: 'reset'});

    Router.registerRoute({name: 'WikiPage', component: WikiPage, modal: true});

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
          <SafeAreaView style={[Styles.box, {backgroundColor: this.state.backgroundColor}]}>
            <View style={Styles.box}>
              <ErrorBoundary>
                {Router.renderNavigatorView()}
              </ErrorBoundary>

              <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>

              <UserAgreement/>
              <DebugView/>
              <FeaturesView/>
              <ScanView/>
            </View>
          </SafeAreaView>
        </ActionSheet>
      </Provider>
    );
  }
}

module.exports = YouTrackMobile; //eslint-disable-line import/no-commonjs

const Styles = StyleSheet.create({
  box: {
    flex: 1
  }
});
