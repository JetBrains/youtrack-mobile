import React, {View, StyleSheet, Image, Text} from 'react-native';
import {logo} from '../../components/icon/icon';
import {UNIT} from '../../components/variables/variables';
import {DEFAULT_BACKEND} from '../../components/config/config';

export default class Home extends React.Component {
  _renderMessage() {
    if (this.props.message) {
      return <Text style={[styles.message, {color: 'red'}]}>{this.props.message}</Text>;
    }

    return <Text style={styles.message}>Connecting to {DEFAULT_BACKEND}...</Text>
  }
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logoImage} source={logo}/>
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
  }
});
