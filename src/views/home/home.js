/* @flow */
import {View, Image, Text, TouchableOpacity, TextInput} from 'react-native';
import React, {Component} from 'react';
import {logo} from '../../components/icon/icon';
import usage from '../../components/usage/usage';
import styles from './home.styles';

type Props = {
  backendUrl: string,
  message: string,
  error: string | {message: string},
  onChangeBackendUrl: (newUrl: string) => any
};

type State = {
  changingYouTrackUrl: boolean,
  youTrackBackendUrl: string
}

export default class Home extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      changingYouTrackUrl: false,
      youTrackBackendUrl: props.backendUrl
    };
    usage.trackScreenView('Loading');
  }

  _renderMessage() {
    if (this.props.error) {
      const message = this.props.error.message || this.props.error;
      return <Text style={[styles.message, {color: 'red'}]}>{message}</Text>;
    }

    if (this.props.message) {
      return <Text style={[styles.message]}>{this.props.message}</Text>;
    }
  }

  _renderUrl() {
    if (!this.props.backendUrl) {
      return;
    }

    if (this.state.changingYouTrackUrl){
      return <View>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
          underlineColorAndroid="transparent"
          style={styles.urlInput}
          placeholder="https://youtrack.example.com"
          onSubmitEditing={() => this.onChangeBackendUrl(this.state.youTrackBackendUrl)}
          value={this.state.youTrackBackendUrl}
          onChangeText={(youTrackBackendUrl) => this.setState({youTrackBackendUrl})}/>
      </View>;
    }

    return <TouchableOpacity onPress={this.editYouTrackUrl.bind(this)} style={styles.urlButton}>
      <Text style={styles.url}>{this.props.backendUrl}</Text>
    </TouchableOpacity>;
  }

  editYouTrackUrl() {
    this.setState({changingYouTrackUrl: true});
  }

  onChangeBackendUrl(newUrl: string) {
    this.setState({changingYouTrackUrl: false});
    this.props.onChangeBackendUrl(newUrl);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logoImage} source={logo}/>
        {this._renderUrl()}
        {this._renderMessage()}

      </View>
    );
  }
}
