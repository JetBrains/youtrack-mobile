import Auth from './components/auth/auth';

import Router from './components/router/router';
import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in__form';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import {loadConfig, getStoredBackendURL} from './components/config/config';

import {BackAndroid, Navigator} from 'react-native';
import React, {PropTypes} from 'react';
import ActionSheet from '@exponent/react-native-action-sheet';

class YouTrackMobile extends React.Component {
  static childContextTypes = {
    actionSheet: PropTypes.func
  };

  constructor() {
    super();
    this.state = {};

    this.registerRoutes();
    this.addAndroidBackButtonSupport();

    getStoredBackendURL()
      .then((backendUrl) => this.initialize(backendUrl));
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef
    };
  }

  checkAuthorization() {
    return this.auth.loadStoredAuthParams()
      .then((authParams) => Router.IssueList({auth: this.auth}))
      .catch((e) => Router.LogIn());
  }

  addAndroidBackButtonSupport() {
    BackAndroid.addEventListener('hardwareBackPress', function () {
      const populated = Router.pop();
      const preventCloseApp = populated;
      return preventCloseApp;
    });
  }

  initialize(youtrackUrl) {
    Router._getNavigator() && Router.Home({
      backendUrl: youtrackUrl,
      error: null,
      message: 'Connecting to YouTrack...'
    });

    loadConfig(youtrackUrl)
      .then(config => {
        this.auth = new Auth(config);
      })
      .then(() => this.checkAuthorization())
      .catch(err => Router.Home({backendUrl: youtrackUrl, error: err}));
  }

  registerRoutes() {
    Router.registerRoute({
      name: 'Home',
      component: Home,
      type: 'reset',
      props: {
        message: `Loading configuration...`,
        onChangeBackendUrl: () => Router.EnterServer({serverUrl: null})
      }
    });

    Router.registerRoute({
      name: 'EnterServer',
      component: EnterServer,
      animation: Navigator.SceneConfigs.FloatFromLeft,
      props: {
        connectToYoutrack: newUrl => {
          return loadConfig(newUrl)
            .then(config => this.auth = new Auth(config))
            .then(() => this.checkAuthorization());
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
      type: 'replace'
    });

    Router.registerRoute({name: 'SingleIssue', component: SingleIssue});

    Router.registerRoute({name: 'ShowImage', component: ShowImage, animation: Navigator.SceneConfigs.FloatFromBottom});

    Router.registerRoute({name: 'CreateIssue', component: CreateIssue});
  }

  render() {
    return <ActionSheet ref={component => this._actionSheetRef = component}>
      {Router.renderNavigatorView({initialRoute: Router.routes.Home})}
    </ActionSheet>;
  }
}

module.exports = YouTrackMobile;
