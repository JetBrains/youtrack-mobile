import Auth from './components/auth/auth';

import Router from './components/router/router';
import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in';
import usage from './components/usage/usage';
import {setNotificationComponent} from './components/notification/notification';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import {loadConfig, getStoredBackendURL} from './components/config/config';
import Toast from 'react-native-easy-toast';

import {BackAndroid, Navigator, View} from 'react-native';
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
    this.getStoredUrlAndProceed();
  }

  async getStoredUrlAndProceed() {
    const backendUrl = await getStoredBackendURL();
    if (backendUrl) {
      this.initialize(backendUrl);
    } else {
      Router.EnterServer({serverUrl: null});
    }
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef
    };
  }

  async checkAuthorization() {
    try {
      await this.auth.loadStoredAuthParams();
      return Router.IssueList({auth: this.auth});
    } catch (e) {
      Router.LogIn();
    }
  }

  addAndroidBackButtonSupport() {
    BackAndroid.addEventListener('hardwareBackPress', function () {
      const populated = Router.pop();
      const preventCloseApp = populated;
      return preventCloseApp;
    });
  }

  async initialize(youtrackUrl) {
    Router._getNavigator() && Router.Home({
      backendUrl: youtrackUrl,
      error: null,
      message: 'Connecting to YouTrack...'
    });

    try {
      const config = await loadConfig(youtrackUrl);
      this.auth = new Auth(config);
      usage.init(config.statisticsEnabled);
      await this.checkAuthorization();
    } catch (error) {
      Router.Home({backendUrl: youtrackUrl, error})
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
      animation: Navigator.SceneConfigs.FloatFromLeft,
      type: 'replace',
      props: {
        connectToYoutrack: newUrl => {
          return loadConfig(newUrl)
            .then(config => {
              this.auth = new Auth(config);
              usage.init(config.statisticsEnabled);
            })
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

    Router.registerRoute({name: 'AttachmentPreview', component: AttachmentPreview, animation: Navigator.SceneConfigs.FloatFromBottom});

    Router.registerRoute({name: 'CreateIssue', component: CreateIssue});
  }

  render() {
    return <ActionSheet ref={component => this._actionSheetRef = component}>
      <View style={{flex: 1}}>
        {Router.renderNavigatorView({initialRoute: Router.routes.Home})}
        <Toast ref={toast => setNotificationComponent(toast)}/>
      </View>
    </ActionSheet>;
  }
}

module.exports = YouTrackMobile;
