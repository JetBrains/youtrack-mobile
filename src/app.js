import Auth from './components/auth/auth';

import Home from './views/home/home';
import LoginForm from './views/log-in/log-in__form';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import {Router, Scene, Actions} from 'react-native-router-flux'
import config from './components/config/config';

import React, {BackAndroid} from 'react-native';

class YouTrackMobile extends React.Component {
  constructor() {
    super();
    this.auth = new Auth(config);
    this.state = {};

    this.addAndroidBackButtonSupport();

    this.checkAuthorization();
  }

  checkAuthorization() {
    return this.auth.loadStoredAuthParams()
      .then((authParams) => Actions.IssueList({auth: this.auth}))
      .catch(() => Actions.LogIn());
  }

  addAndroidBackButtonSupport() {
    BackAndroid.addEventListener('hardwareBackPress', function() {
      try {
        Actions.pop();
        return true;
      } catch (e) {
        return false;
      }
    });
  }

  render() {
    return (
      <Router hideNavBar={true}>
        <Scene key="root">
          <Scene key="Home"
                 component={Home}
                 initial={true}/>

          <Scene key="LogIn"
                 type="replace"
                 component={() => <LoginForm auth={this.auth} onLogIn={this.checkAuthorization.bind(this)}/>}/>

          <Scene key="IssueList"
                 title="Issues"
                 type="replace"
                 component={IssueList}/>

          <Scene key="ShowImage"
                 title="Image"
                 direction="vertical"
                 component={ShowImage}/>

          <Scene key="SingleIssue"
                 title="Issue"
                 component={SingleIssue}/>

          <Scene key="CreateIssue"
                 title="Create Issue"
                 component={CreateIssue}/>
        </Scene>
      </Router>
    );
  }
}

module.exports = YouTrackMobile;
