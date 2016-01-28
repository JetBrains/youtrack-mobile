import React, {Image, View, Text, TextInput} from 'react-native'
import {logo} from '../../components/icon/icon';

import styles from './log-in.styles';

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
                <View style={styles.logoContainer}>
                    <Image style={styles.logoImage} source={logo}/>
                </View>

                <Text style={styles.welcome}>
                    Login to YouTrack
                </Text>

                <View style={styles.inputsContainer}>
                    <TextInput
                        autoFocus={true}
                        style={styles.input}
                        placeholder="Username"
                        onChangeText={(username) => this.setState({username})}/>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        password={true} onChangeText={(password) => this.setState({password})}/>
                </View>

                <View style={styles.actionsContainer}>
                    <View style={styles.signin}>
                        <Text
                            style={styles.signinText}
                            onPress={this.logInViaCredentials.bind(this)}>Log in</Text>
                    </View>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkLike} onPress={this.logInViaCredentials.bind(this)}>
                            Log in via Browser</Text>
                    </View>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkLike} onPress={this.logInViaCredentials.bind(this)}>
                            Sign up</Text>
                    </View>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkLike} onPress={this.logInViaCredentials.bind(this)}>
                            Log in as guest</Text>
                    </View>
                </View>

                <View style={styles.description}>
                    <Text style={styles.descriptionText}>You can log in with your credentials for JetBrains Account,
                        Active Directory (Domain) Labs or Attlassian Jira</Text>
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