/* @flow */
import store from './store';
import { Provider } from 'react-redux';
import {initializeApi} from './actions';
import PubSub from 'pubsub-js';
import Auth from './components/auth/auth';
import Router from './components/router/router';
import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in';
import usage from './components/usage/usage';
import log from './components/log/log';
import {setNotificationComponent} from './components/notification/notification';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/single-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import AgileBoard from './views/agile-board/agile-board';
import {loadConfig, getStoredConfig} from './components/config/config';
import {COLOR_BLACK} from './components/variables/variables';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';

import {BackHandler, View, UIManager} from 'react-native';
import React, {PropTypes, Component} from 'react';
import ActionSheet from '@expo/react-native-action-sheet';
import type {AppConfigFilled} from './flow/AppConfig';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
/*
  Uncomment this string to debug network request in Chrome. Chrome should be run with --disable-web-security flag.
  Or use React Native Debugger https://github.com/jhen0409/react-native-debugger
  https://github.com/facebook/react-native/issues/934
*/
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

class YouTrackMobile extends Component {
  state: Object;
  auth: Auth;
  _actionSheetRef: Object;

  static childContextTypes = {
    actionSheet: PropTypes.func
  };

  constructor() {
    super();

    this.registerRoutes();
    this.addAndroidBackButtonSupport();
    this.getStoredUrlAndProceed();
  }

  async getStoredUrlAndProceed() {
    const storedConfig = await getStoredConfig();
    if (storedConfig) {
      return this.initialize(storedConfig);
    }
    Router.EnterServer({serverUrl: null});
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef
    };
  }

  async checkAuthorization() {
    await this.auth.loadStoredAuthParams();
    store.dispatch(initializeApi(this.auth));
    return Router.IssueList();
  }

  addAndroidBackButtonSupport() {
    BackHandler.addEventListener('hardwareBackPress', function () {
      const populated = Router.pop();
      const preventCloseApp = populated;
      return preventCloseApp;
    });
  }

  async initializeAuth(config: AppConfigFilled) {
    this.auth = new Auth(config);
    usage.init(config.statisticsEnabled);
    return await this.checkAuthorization();
  }

  async initialize(config: AppConfigFilled) {
    Router._getNavigator() && Router.Home({
      backendUrl: config.backendUrl,
      error: null,
      message: 'Connecting to YouTrack...'
    });

    try {
      await this.initializeAuth(config);
    } catch (error) {
      log.warn('App failed to initialize auth. Will try to reload config.', error);
      let reloadedConfig;
      try {
        reloadedConfig = await loadConfig(config.backendUrl);
      } catch (error) {
        return Router.Home({backendUrl: config.backendUrl, error});
      }

      try {
        await this.initializeAuth(reloadedConfig);
      } catch (e) {
        return Router.LogIn();
      }
    }
  }

  registerRoutes() {
    Router.registerRoute({
      name: 'Home',
      component: Home,
      type: 'reset',
      props: {
        message: `Loading configuration...`,
        onChangeBackendUrl: (oldUrl) => Router.EnterServer({serverUrl: oldUrl})
      }
    });

    Router.registerRoute({
      name: 'EnterServer',
      component: EnterServer,
      type: 'reset',
      props: {
        connectToYoutrack: newUrl => {
          return loadConfig(newUrl)
            .then(config => {
              this.auth = new Auth(config);
              usage.init(config.statisticsEnabled);
              Router.LogIn();
            });
        }
      }
    });

    const getAuth = () => this.auth;

    Router.registerRoute({
      name: 'LogIn',
      component: LoginForm,
      props: {
        get auth() {
          return getAuth();
        },
        onLogIn: this.checkAuthorization.bind(this),
        onChangeServerUrl: youtrackUrl => Router.EnterServer({serverUrl: youtrackUrl})
      },
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

    Router.finalizeRoutes('Home');
  }

  handleOrientationChange = (event: Object) => {
    const {width, height} = event.nativeEvent.layout;
    const orientation = (width > height) ? 'LANDSCAPE' : 'PORTRAIT';
    PubSub.publish('YTM_ORIENTATION_CHANGE', orientation);
  }

  render() {
    return (
      <Provider store={store}>
        <ActionSheet ref={component => this._actionSheetRef = component}>
          <View style={{flex: 1, backgroundColor: COLOR_BLACK}} onLayout={this.handleOrientationChange}>
            {Router.renderNavigatorView()}
            <Toast ref={toast => setNotificationComponent(toast)}/>
          </View>
        </ActionSheet>
      </Provider>
    );
  }
}

module.exports = YouTrackMobile; //eslint-disable-line import/no-commonjs
