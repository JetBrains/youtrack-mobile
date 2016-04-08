import Auth from './components/auth/auth';

import Router from './components/router/router';
import Home from './views/home/home';
import LoginForm from './views/log-in/log-in__form';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import config from './components/config/config';

import React, {BackAndroid, Navigator} from 'react-native';

class YouTrackMobile extends React.Component {
  constructor() {
    super();
    this.auth = new Auth(config);
    this.state = {};

    this.addAndroidBackButtonSupport();

    this.checkAuthorization();

    Router.registerRoute({
      name: 'LogIn',
      component: LoginForm,
      props: {auth: this.auth, onLogIn: this.checkAuthorization.bind(this)},
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

  render() {
    return <Navigator
      initialRoute={{component: Home, type: 'reset'}}
      configureScene={(route) => {
          return route.animation || Navigator.SceneConfigs.FloatFromRight;
        }
      }
      renderScene={(route, navigator) => {
          Router.setNavigator(navigator);

          return React.createElement(route.component, route.props);
        }
      }
    />
  }
}

module.exports = YouTrackMobile;
