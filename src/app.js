import Auth from './components/auth/auth';

import Router from './components/router/router';
import Home from './views/home/home';
import LoginForm from './views/log-in/log-in__form';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import {loadConfig, getStoredBackendURL} from './components/config/config';

import React, {BackAndroid, Navigator} from 'react-native';

class YouTrackMobile extends React.Component {
  constructor() {
    super();
    this.state = {};

    Router.registerRoute({
      name: 'Home',
      component: Home,
      type: 'reset',
      props: {
        message: `Loading configuration...`,
        onChangeBackendUrl: this.initialize.bind(this)
      }
    });

    this.addAndroidBackButtonSupport();

    getStoredBackendURL()
      .then((backendUrl) => this.initialize(backendUrl));
  }

  checkAuthorization() {
    return this.auth.loadStoredAuthParams()
      .then((authParams) => Router.IssueList({auth: this.auth}))
      .catch((e) => Router.LogIn());
  }

  addAndroidBackButtonSupport() {
    BackAndroid.addEventListener('hardwareBackPress', function() {
      try {
        Router.pop();
        return true;
      } catch (e) {
        return false;
      }
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
      .then(() => this.registerRoutes())
      .then(() => this.checkAuthorization())
      .catch(err => Router.Home({error: err}));
  }

  registerRoutes() {
    Router.registerRoute({
      name: 'LogIn',
      component: LoginForm,
      props: {auth: this.auth, onLogIn: this.checkAuthorization.bind(this), onChangeBackendUrl: this.initialize.bind(this)},
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
    return Router.renderNavigatorView({initialRoute: Router.routes.Home});
  }
}

module.exports = YouTrackMobile;
