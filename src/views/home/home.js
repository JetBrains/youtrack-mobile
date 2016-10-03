/* @flow */
import {View, Image, Text, TouchableOpacity} from 'react-native';
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
  youTrackBackendUrl: string
}

export default class Home extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
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

    return <TouchableOpacity onPress={() => this.props.onChangeBackendUrl(this.props.backendUrl)} style={styles.urlButton}>
      <Text style={styles.url}>{this.props.backendUrl}</Text>
    </TouchableOpacity>;
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
