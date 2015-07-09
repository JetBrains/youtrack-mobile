var React = require('react-native');
var Auth = require('../auth/auth');
var LogIn = require('../../views/log-in/log-in');

var {
    StyleSheet,
    Text,
    View,
    TouchableHighlight
    } = React;

class YouTrackMobile extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        var auth = new Auth();
        auth.readStoredAuthPromise.then((authParams) => {
            if (!authParams) {
                this.openLogIn();
            }
        })
    }

    openLogIn() {
    }

    logInViaHub() {
        var auth = new Auth();
        auth.authorizeAndStoreToken().then((res) => {
            let accessToken = res.access_token;
            this.setState({accessToken});
        });
    }

    fetchSomething(token) {
        return fetch('https://hackathon15.labs.intellij.net/youtrack/rest/issue', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (res) {
                return res.json();
            })
            .catch(function (res) {
                console.warn(res);
            })
            .then(function (resJson) {
                console.log(resJson);
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to YouTrack Mobile Demo!
                </Text>

                <Text style={styles.instructions}>
                    Access Token: {this.state && this.state.accessToken || 'Not received yet'}
                </Text>

                <TouchableHighlight
                    style={{borderWidth: 1}}
                    onPress={this.logInViaHub}>
                    <Text style={styles.welcome}>Log In via Hub!</Text>
                </TouchableHighlight>

                <TouchableHighlight
                    style={{borderWidth: 1}}
                    onPress={this.fetchSomething}>
                    <Text style={styles.welcome}>Fetch Something!</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5
    }
});

module.exports = YouTrackMobile;