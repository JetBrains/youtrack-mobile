import React, {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import {logo} from '../../components/icon/icon';
import {UNIT, COLOR_FONT_GRAY} from '../../components/variables/variables';
import Prompt from 'react-native-prompt';

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      promptVisible: false
    };
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
    return <TouchableOpacity onPress={this.openYouTrackUrlPrompt.bind(this)}>
      <Text style={styles.url}>{this.props.backendUrl}    Change...</Text>
    </TouchableOpacity>;
  }

  openYouTrackUrlPrompt() {
    this.setState({promptVisible: true});
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logoImage} source={logo}/>
        {this._renderUrl()}
        {this._renderMessage()}

        <Prompt
          title="Enter another YouTrack URL"
          placeholder="https://youtrack.example.com"
          defaultValue={this.props.backendUrl}
          visible={this.state.promptVisible}
          onCancel={() => this.setState({promptVisible: false})}
          onSubmit={this.props.onChangeBackendUrl.bind(this)}/>
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
  url: {
    marginTop: UNIT * 2,
    color: COLOR_FONT_GRAY
  }
});
