var React = require('react-native');
var Auth = require('../../blocks/auth/auth');
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

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to YouTrack Mobile Demo!
                </Text>

                <TouchableHighlight
                    style={{borderWidth: 1}}
                    onPress={this.logInViaHub}>
                    <Text style={styles.welcome}>Log In</Text>
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
    }
});

module.exports = YouTrackMobile;