import React, {Image, View, Text, TextInput, TouchableOpacity} from 'react-native'
import {logo} from '../../components/icon/icon';
import openUrl from '../../components/open-url/open-url.ios';
import appConfig from '../../components/app/app__config';

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
                    <TouchableOpacity style={styles.signin} onPress={this.logInViaCredentials.bind(this)}>
                        <Text
                            style={styles.signinText}>Log in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkContainer} onPress={this.logInViaHub.bind(this)}>
                        <Text style={styles.linkLike}>
                            Log in via Browser</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkContainer} onPress={this.signUp.bind(this)}>
                        <Text style={styles.linkLike}>
                            Sign up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkContainer} onPress={this.loginAsGuest.bind(this)}>
                        <Text style={styles.linkLike}>
                            Log in as guest</Text>
                    </TouchableOpacity>
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

    signUp() {
        openUrl(`${appConfig.auth.serverUri}/auth/register`);
    }

    loginAsGuest() {
        console.log('TODO: Not implemented');
    }
}