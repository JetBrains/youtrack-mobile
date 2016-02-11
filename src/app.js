import Auth from './components/auth/auth';

import Home from './views/home/home';
import LoginForm from './views/log-in/log-in__form';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/singe-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import {Router, Route, Schema, Actions} from 'react-native-router-flux'

import React, {Navigator, BackAndroid} from 'react-native';

class YouTrackMobile extends React.Component {
    constructor() {
        super();
        this.auth = new Auth();
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
            <Router hideNavBar={true} >
                <Schema name="modal" sceneConfig={Navigator.SceneConfigs.FloatFromBottom}/>
                <Schema name="default" sceneConfig={Navigator.SceneConfigs.FloatFromRight}/>

                <Route name="Home" title="Home" component={Home} initial={true}/>

                <Route name="LogIn" schema="modal" type="reset" component={() => <LoginForm auth={this.auth} onLogIn={this.checkAuthorization.bind(this)}/>}/>
                <Route name="IssueList" title="Issues" type="reset" component={IssueList}/>
                <Route name="ShowImage" title="Image" schema="modal" component={ShowImage}/>
                <Route name="SingleIssue" title="Issue" component={SingleIssue}/>
                <Route name="CreateIssue" title="Create Issue" component={CreateIssue}/>
            </Router>
        );
    }
}


module.exports = YouTrackMobile;