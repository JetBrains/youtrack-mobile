/* @flow */
import {View, Image, Text, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';
import {logo} from '../../components/icon/icon';
import usage from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
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

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      youTrackBackendUrl: props.backendUrl
    };
    usage.trackScreenView('Loading');
  }

  _renderMessage() {
    const {error, message} = this.props;
    if (error) {
      // $FlowFixMe
      const message: string = error.message || error;
      return <Text style={[styles.message, {color: 'red'}]}>{message}</Text>;
    }

    if (message) {
      return <Text style={[styles.message]}>{message}</Text>;
    }
  }

  _renderUrl() {
    if (!this.props.backendUrl) {
      return;
    }

    return <TouchableOpacity onPress={() => this.props.onChangeBackendUrl(this.props.backendUrl)} style={styles.urlButton}>
      <Text style={styles.url}>{formatYouTrackURL(this.props.backendUrl)}</Text>
    </TouchableOpacity>;
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        {this._renderUrlButton()}

        <View style={styles.messageContainer}>
          {this._renderRetryAction()}
          {this._renderMessage()}
        </View>

      </View>
    );
  }
}
