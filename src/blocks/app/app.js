var React = require('react-native');
var Auth = require('../auth/auth');
var LogIn = require('../../views/log-in/log-in');
var IssueList = require('../../views/issue-list/issue-list');

var {View, Navigator, Text, TouchableOpacity, StyleSheet} = React;

class YouTrackMobile extends React.Component {

    constructor() {
        super();
        this.auth = new Auth();
    }

    componentDidMount() {
    }

    checkAuthorization() {
        return this.auth.loadStoredAuthParams().then((authParams) => {
            if (!authParams) {
                return this.goToLogIn();
            }
            return this.goToIssues();
        });
    }

    goToRootAndCheckAuth() {
        this.refs.navigator.pop();
        return this.checkAuthorization();
    }

    goToIssues() {
        this.refs.navigator.push({
            component: <IssueList auth={this.auth} onBack={this.goToRootAndCheckAuth.bind(this)}></IssueList>,
            title: 'Issues'
        });
    }

    goToLogIn() {
        this.refs.navigator.push({
            component: <LogIn auth={this.auth} onBack={this.goToRootAndCheckAuth.bind(this)}></LogIn>,
            title: 'Log In'
        });
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
                <View style={styles.container}>{route.component}</View>
            )}/>;
    }
}

var styles = StyleSheet.create({
    container: {flex: 1}
});

module.exports = YouTrackMobile;