import React, {View, StyleSheet, Image, Text} from 'react-native';
import {logo} from '../../components/icon/icon';
import {UNIT} from '../../components/variables/variables';
import {DEFAULT_BACKEND} from '../../components/config/config';

export default class Home extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logoImage} source={logo}/>
        <Text style={styles.message}>Connecting to</Text>
        <Text>{DEFAULT_BACKEND}</Text>
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
    marginTop: UNIT * 2
  }
});
