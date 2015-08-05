var React = require('react-native');
var Auth = require('../auth/auth');
var LogIn = require('../../views/log-in/log-in');
var IssueList = require('../../views/issue-list/issue-list');

var {View, Image, Navigator, Text, TouchableOpacity, StyleSheet} = React;

class YouTrackMobile extends React.Component {

    constructor() {
        super();
        this.auth = new Auth();
    }

    checkAuthorization() {
        return this.auth.loadStoredAuthParams().then((authParams) => this.goToIssues())
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
        return <LogIn></LogIn>;
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