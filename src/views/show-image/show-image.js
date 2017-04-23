/* @flow */
import {StyleSheet, View, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import React from 'react';
import {closeOpaque} from '../../components/icon/icon';
import Router from '../../components/router/router';
import {UNIT} from '../../components/variables/variables';
import Gallery from 'react-native-gallery';
import once from 'lodash.once';

const TOUCH_PADDING = 12;

const hitSlop = {
  top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING
};

type Props = {
  allImagesUrls: Array<string>,
  currentImage: string,
  imageHeaders: ?Object
}

export function ShowImage(props: Props) {
  const currentIndex = props.allImagesUrls.indexOf(props.currentImage);

  const allImageSources = props.allImagesUrls.map(uri => ({
    uri: uri,
    headers: props.imageHeaders
  }));

  const closeView = once(function closeView() {
    return Router.pop();
  });

  return (
    <View style={styles.container}>
      <Gallery
        style={styles.gallery}
        imagesSources={allImageSources}
        initialPage={currentIndex}
        loader={<ActivityIndicator style={styles.loader} size="large"/>}
        onSlideUp={closeView}
        onSlideDown={closeView}
        pixels={{
          width: 200, //Hack around https://github.com/ldn0x7dc/react-native-transformable-image/issues/15
          height: 200
        }}
      />

      <TouchableOpacity style={styles.closeButton}
                        onPress={closeView}
                        hitSlop={hitSlop}>
        <Image style={styles.closeIcon} source={closeOpaque}></Image>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  gallery: {
    flex: 1,
    backgroundColor: 'black'
  },

  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  closeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3
  },

  closeIcon: {
    width: 30,
    height: 30
  }
});

export default ShowImage;
