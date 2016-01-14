import Auth from '../auth/auth';
import LogIn from '../../views/log-in/log-in';
import IssueList from '../../views/issue-list/issue-list';

import React, {View, Image, Navigator, Text, TouchableOpacity, StyleSheet} from 'react-native';

class YouTrackMobile extends React.Component {

    constructor() {
        super();
        this.auth = new Auth();
        this.state = {};
    }

    checkAuthorization() {
        return this.auth.loadStoredAuthParams()
            .then((authParams) => this.goToIssues())
            .catch((err) => this.setState({loginMessage: err}));
    }

    goToRootAndCheckAuth() {
        this.refs.navigator.pop();
        return this.checkAuthorization();
    }

    goToIssues() {
        this.refs.navigator.push({
            component: <IssueList auth={this.auth} onBack={this.goToRootAndCheckAuth.bind(this)} navigator={this.refs.navigator}></IssueList>,
            title: 'Issues'
        });
    }

    getLoginView() {
        return <LogIn message={this.state.loginMessage}></LogIn>;
    }

    render() {
        return <Navigator ref="navigator"
            initialRoute={{title: 'RootRoute'}}
            onDidFocus={(route) => {
                if (route.title === 'RootRoute') {
                    this.checkAuthorization();
                }
            }}
            renderScene={(route, navigator) => (
                <View style={styles.container}>{route.component || this.getLoginView()}</View>
            )}/>;
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});


module.exports = YouTrackMobile;