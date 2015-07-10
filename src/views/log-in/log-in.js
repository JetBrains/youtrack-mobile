var React = require('react-native');
var Auth = require('../../blocks/auth/auth');
var {
    StyleSheet,
    Text,
    View,
    TouchableHighlight
    } = React;

class LogIn extends React.Component {

    componentDidMount() {
        //Always log in for a while
        this.logInViaHub();
    }

    logInViaHub() {
        this.props.auth.authorizeAndStoreToken()
            .then((res) => this.props.onBack());
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to YouTrack Mobile Demo!
                </Text>

                <TouchableHighlight
                    style={{borderWidth: 1}}
                    onPress={this.logInViaHub.bind(this)}>
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

module.exports = LogIn;