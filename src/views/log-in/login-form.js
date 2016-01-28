const React = require('react-native');
import {Actions} from 'react-native-router-flux'

const {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableHighlight
} = React;

export default class LoginForm extends React.Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: ''
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputsContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        onChangeText={(username) => this.setState({username})}/>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        password={true} onChangeText={(password) => this.setState({password})}/>
                </View>

                <View style={styles.signin}>
                    <Text
                        style={styles.signinText}
                        onPress={this.logInViaCredentials.bind(this)}>Sign In</Text>
                </View>

                <View style={styles.loginViaHub}>
                    <TouchableHighlight
                        onPress={this.logInViaHub.bind(this)}>
                        <Text>Log In Via Hub</Text>
                    </TouchableHighlight>
                </View>

            </View>
        );
    }

    logInViaCredentials() {
        this.props.auth.authorizeCredentials(this.state.username, this.state.password)
            .then(() => this.props.onLogIn());
    }

    logInViaHub() {
        this.props.auth.authorizeOAuth()
            .then(() => this.props.onLogIn());
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    loginViaHub: {
        padding: 20,
        backgroundColor: 'gray',
        alignItems: 'center'
    },
    signin: {
        marginBottom: 10,
        padding: 20,
        backgroundColor: '#FF3366',
        alignItems: 'center'
    },
    signinText: {
        alignSelf: 'stretch',
        textAlign: 'center'
    },
    input: {
        flex: 1,
        height: 32,
        backgroundColor: '#FFF',
        color: '#7E7E84',
        marginBottom: 10,
    },
    inputsContainer: {
        padding: 8,
        marginBottom: 10,
        alignItems: 'center'
    }
});