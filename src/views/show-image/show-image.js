import React, {StyleSheet, Image, View, Text, ScrollView} from 'react-native';

import Header from '../../components/header/header';

class ShowImage extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Header leftButton={<Text>Close</Text>}>
          <Text>{this.props.imageName}</Text>
        </Header>
        <ScrollView contentContainerStyle={styles.scrollView} maximumZoomScale={20}>
          <View style={{flex: 1}}>
            <Image style={styles.image} source={{uri: this.props.imageUrl}}/>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  scrollView: {
    flex: 1
  },
  image: {
    resizeMode: 'contain',
    flex: 1
  }
});

module.exports = ShowImage;
