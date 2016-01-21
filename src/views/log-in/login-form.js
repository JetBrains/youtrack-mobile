const React = require('react-native');
import {Actions} from 'react-native-router-flux'

const {
    StyleSheet,
    View,
    Text,
    TextInput
    } = React;

const LoginForm = React.createClass({
    getInitialState: function() {
        return {
            username: '',
            password: ''
        }
    },

    render: function() {
        return (
            <View style={styles.container}>

                <View style={styles.header}>
                </View>

                <View style={styles.inputs}>
                    <TextInput
                        placeholder="Username"
                        onChangeText={(username) => this.setState({username})}/>
                    <TextInput
                        placeholder="Password"
                        password={true} onChangeText={(password) => this.setState({password})}/>
                </View>

                <View style={styles.signin}>
                    <Text
                        style={styles.signinText}
                        onPress={this.onPress}>Sign In</Text>
                </View>

            </View>
        );
    },

    onPress: function() {

        // TODO(maksimrv): Handle auth error on login form
        this.props.auth.obtainTokenByCredentials(this.state.username, this.state.password).then((response) => {
            this.props.auth.storeAuth(response)
                .then(this.props.auth.loadStoredAuthParams.bind(this.props.auth))
                .then(() => {
                    Actions.IssueList({auth: this.props.auth})
                });
        });
    }
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: .5,
        backgroundColor: 'transparent'
    },
    signin: {
        padding: 20,
        backgroundColor: '#FF3366',
        alignItems: 'center'
    },
    signinText: {
        alignSelf: 'stretch',
        textAlign: 'center'
    },
    inputs: {
        marginTop: 10,
        marginBottom: 10,
        flex: .25
    }
});


module.exports = LoginForm;