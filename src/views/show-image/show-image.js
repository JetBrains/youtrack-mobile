import React, {StyleSheet, Image, View, Text, ScrollView, TouchableOpacity} from 'react-native';
const TOUCH_PADDING = 12;
import Router from '../../components/router/router';

class ShowImage extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView} maximumZoomScale={20}>
          <View style={{flex: 1}}>
            <Image style={styles.image} source={{uri: this.props.imageUrl}}/>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton}
                          onPress={() => Router.pop()}
                          hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}>
          <Text>Close</Text>
        </TouchableOpacity>
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
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: '#FFF7',
    borderRadius: 4,
    padding: 16,
    bottom: 16,
    left: 16
  }
});

module.exports = ShowImage;
