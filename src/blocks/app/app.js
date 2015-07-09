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
        this.auth.readStoredAuthPromise.then((authParams) => {
            if (!authParams) {
                return this.goToLogIn();
            }
            return this.goToIssues();
        })
    }

    goToIssues() {
        this.refs.navigator.push({
            component: <IssueList auth={this.auth} navigator={this.refs.navigator}></IssueList>,
            title: 'Issues'
        })
    }

    goToLogIn() {
        this.refs.navigator.push({
            component: <LogIn auth={this.auth} navigator={this.refs.navigator}></LogIn>,
            title: 'Log In'
        })
    }

    render() {
        return <Navigator ref="navigator"
            initialRoute={{title: 'RootRoute'}}
            renderScene={(route, navigator) => (
                <View style={styles.container}>{route.component}</View>
            )}/>;
    }
}

var styles = StyleSheet.create({
    container: {flex: 1}
});

module.exports = YouTrackMobile;