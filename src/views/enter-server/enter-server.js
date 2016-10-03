/* @flow */
import {Image, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {logo} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';

import styles from './enter-server.styles';

const CATEGORY_NAME = 'Choose server';

type Props = {
  serverUrl: string,
  connectToYoutrack: (newServerUrl: string) => Promise<AppConfigFilled>,
  onCancel: () => any
};

type State = {
  serverUrl: string,
  connecting: boolean,
  error: ?Object
};

export default class EnterServer extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      serverUrl: props.serverUrl,
      connecting: false,
      error: null
    };

    usage.trackScreenView(CATEGORY_NAME);
  }

  onApplyServerUrlChange() {
    this.setState({connecting: true});

    return this.props.connectToYoutrack(this.state.serverUrl)
      .catch(error => this.setState({error: error, connecting: false}));
  }

  getErrorMessage(error: Object) {
    return error.message;
  }

  render() {

    const error = this.state.error ?
      <View style={styles.errorContainer}>
        <Text style={styles.error}>{this.getErrorMessage(this.state.error)}</Text>
      </View> :
      null;

    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps={true}>
        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        <View>
          <Text style={styles.title}>Enter YouTrack URL</Text>
        </View>

        <View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholder="http://example.com"
            returnKeyType="done"
            keyboardType="url"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.onApplyServerUrlChange()}
            value={this.state.serverUrl}
            onChangeText={(serverUrl) => this.setState({serverUrl})}/>

          {error}

          <TouchableOpacity style={[styles.apply, this.state.connecting ? styles.applyDisabled : {}]}
                            disabled={this.state.connecting}
                            onPress={this.onApplyServerUrlChange.bind(this)}>
            <Text style={styles.applyText}>Next</Text>
            {this.state.connecting && <ActivityIndicator style={styles.connectingIndicator}/>}
          </TouchableOpacity>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}
