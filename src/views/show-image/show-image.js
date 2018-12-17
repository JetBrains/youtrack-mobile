/* @flow */
import {StyleSheet, View, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {PureComponent} from 'react';
import {closeOpaque, trash} from '../../components/icon/icon';
import Router from '../../components/router/router';
import {UNIT} from '../../components/variables/variables';
import {notifyError} from '../../components/notification/notification';
import once from 'lodash.once';
import Gallery from 'react-native-image-gallery';
import ImageProgress from 'react-native-image-progress';

const TOUCH_PADDING = 12;

const hitSlop = {
  top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING
};

type Props = {
  allImagesUrls: Array<string>,
  currentImage: string,
  imageHeaders: ?Object,
  onRemoveImage?: (currentPage: number) => any
}

type State = {
  currentPage: number
}

function renderImage(imageProps, imageDimensions) {
  return (
    <ImageProgress
      renderIndicator={() => <ActivityIndicator style={styles.loader} size="large"/>}
      onError={error => notifyError('Failed to load image', error)}
      {...imageProps}
    />
  );
}

const closeView = once(function closeView() {
  return Router.pop();
});

export class ShowImage extends PureComponent<Props, State> {
  componentDidMount() {
    const currentPage = this.props.allImagesUrls.indexOf(this.props.currentImage);
    this.setState({currentPage});
  }

  onPageSelected = (currentPage: number) => this.setState({currentPage});

  onRemove = async () => {
    const {currentPage} = this.state;
    Alert.alert(
      'Confirmation',
      'Delete attachment?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: async () => {
          if (!this.props.onRemoveImage) {
            return;
          }
          await this.props.onRemoveImage(currentPage);
          closeView();
        }}
      ],
      {cancelable: true}
    );
  };

  render() {
    const currentIndex = this.props.allImagesUrls.indexOf(this.props.currentImage);

    const allImageSources = this.props.allImagesUrls.map(uri => ({
      source: {
        uri,
        headers: this.props.imageHeaders
      }
    }));

    return (
      <View style={styles.container}>
        <Gallery
          style={styles.gallery}
          images={allImageSources}
          initialPage={currentIndex}
          imageComponent={renderImage}
          onPageSelected={this.onPageSelected}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeView}
          hitSlop={hitSlop}
        >
          <Image style={styles.closeIcon} source={closeOpaque}></Image>
        </TouchableOpacity>

        {this.props.onRemoveImage && <TouchableOpacity
          style={styles.removeButton}
          onPress={this.onRemove}
          hitSlop={hitSlop}
        >
          <Image style={styles.removeIcon} source={trash}></Image>
        </TouchableOpacity>}
      </View>
    );
  }
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

  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    right: UNIT * 3
  },

  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },

  removeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    opacity: 0.4
  }
});

export default ShowImage;
