/* @flow */
import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {closeOpaque} from '../../components/icon/icon';
import Router from '../../components/router/router';
import {UNIT} from '../../components/variables/variables';
import Gallery from 'react-native-gallery';

const TOUCH_PADDING = 12;

const hitSlop = {
  top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING
};

type Props = {
  allImagesUrls: Array<string>,
  currentImage: string
}

export function ShowImage(props: Props) {

  const currentIndex = props.allImagesUrls.indexOf(props.currentImage);

  return (
    <View style={styles.container}>
      <Gallery
        style={{flex: 1, backgroundColor: 'black'}}
        images={props.allImagesUrls}
        initialPage={currentIndex}
      />

      <TouchableOpacity style={styles.closeButton}
                        onPress={() => Router.pop()}
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
