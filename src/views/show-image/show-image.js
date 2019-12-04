/* @flow */
import {View, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {PureComponent} from 'react';
import {closeOpaque, trash} from '../../components/icon/icon';
import Router from '../../components/router/router';
import {notify} from '../../components/notification/notification';
import once from 'lodash.once';
import Gallery from 'react-native-image-gallery';
import ImageProgress from 'react-native-image-progress';
import {SvgFromUri} from 'react-native-svg';
import {hasMimeType} from '../../components/mime-type/mime-type';

import styles from './show-image.styles';

import type {Attachment} from '../../flow/CustomFields';

const TOUCH_PADDING = 12;

const hitSlop = {
  top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING
};

type Props = {
  imageAttachments: Array<Attachment>,
  current: Attachment,
  imageHeaders: ?Object,
  onRemoveImage?: (currentPage: number) => any
}

type State = {
  currentPage: number
}

export class ShowImage extends PureComponent<Props, State> {
  componentDidMount() {
    const currentPage = this.getCurrentPage(this.props.current);
    this.setState({currentPage});
  }

  renderImage = (imageProps: Object) => {
    const source = imageProps.source;
    const attach = source && this.props.imageAttachments[this.getCurrentPage(source)];

    if (hasMimeType.svg(attach)) {
      return <SvgFromUri
        width="100%"
        height="100%"
        uri={attach.url}
      />;
    }

    return (
      <ImageProgress
        renderIndicator={() => <ActivityIndicator style={styles.loader} size="large"/>}
        onError={error => notify('Failed to load image')}
        {...imageProps}
      />
    );
  };

  getCurrentPage(current: Attachment) {
    return this.props.imageAttachments.findIndex(attach => attach.id === current.id);
  }

  closeView = once(function closeView() {
    return Router.pop();
  });

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
          this.closeView();
        }}
      ],
      {cancelable: true}
    );
  };

  render() {
    const currentIndex = this.getCurrentPage(this.props.current);
    const createSource = attach => ({
      source: {
        id: attach.id,
        uri: attach.url,
        headers: this.props.imageHeaders,
        mimeType: attach.mimeType
      }
    });

    return (
      <View style={styles.container}>
        <Gallery
          style={styles.gallery}
          images={this.props.imageAttachments.map(createSource)}
          initialPage={currentIndex}
          imageComponent={this.renderImage}
          onPageSelected={this.onPageSelected}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={this.closeView}
          hitSlop={hitSlop}
        >
          <Image style={styles.closeIcon} source={closeOpaque}/>
        </TouchableOpacity>

        {this.props.onRemoveImage && <TouchableOpacity
          style={styles.removeButton}
          onPress={this.onRemove}
          hitSlop={hitSlop}
        >
          <Image style={styles.removeIcon} source={trash}/>
        </TouchableOpacity>}
      </View>
    );
  }
}

export default ShowImage;
