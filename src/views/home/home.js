import {View, StyleSheet, Image, Text, TouchableOpacity, TextInput} from 'react-native';
import React from 'react';
import {logo} from '../../components/icon/icon';
import usage from '../../components/usage/usage';
import {UNIT, COLOR_FONT_GRAY, COLOR_PINK, FONT_SIZE} from '../../components/variables/variables';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changingYouTrackUrl: false,
      youTrackBackendUrl: props.backendUrl
    };
    usage.trackScreenView('Loading screen');
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

  onChangeBackendUrl(newUrl) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  logoImage: {
    height: UNIT * 20,
    resizeMode: 'contain'
  },
  message: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: UNIT * 2,
    textAlign: 'center'
  },
  urlButton: {
    position: 'absolute',
    left: 0,
    right: 0
  },
  url: {
    textAlign: 'center',
    marginTop: UNIT * 2,
    color: COLOR_FONT_GRAY
  },
  urlInput: {
    height: UNIT * 5,
    width: 240,
    backgroundColor: '#FFF',
    fontSize: FONT_SIZE,
    borderBottomColor: COLOR_PINK,
    borderBottomWidth: 1
  }
});
