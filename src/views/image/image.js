/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity, ActivityIndicator} from 'react-native';

import {SvgFromUri} from 'react-native-svg';
import Gallery from 'react-native-image-gallery';
import ImageProgress from 'react-native-image-progress';

import once from 'lodash.once';
import Router from '../../components/router/router';
import {IconClose} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';
import {hasMimeType} from '../../components/mime-type/mime-type';
import ModalView from '../../components/modal-view/modal-view';
import {COLOR_PINK} from '../../components/variables/variables';
import {HIT_SLOP} from '../../components/common-styles/button';

import styles from './image.styles';

import type {Attachment} from '../../flow/CustomFields';

type Props = {
  imageAttachments: Array<Attachment>,
  current: Attachment,
  imageHeaders: ?Object,
  onRemoveImage?: (currentPage: number) => any
}

type State = {
  currentPage: number
}

export class Image extends PureComponent<Props, State> {
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
      <ModalView style={styles.container}>
        <Gallery
          style={styles.container}
          images={this.props.imageAttachments.map(createSource)}
          initialPage={currentIndex}
          imageComponent={this.renderImage}
          onPageSelected={this.onPageSelected}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={this.closeView}
          hitSlop={HIT_SLOP}
        >
          <IconClose size={28} color={COLOR_PINK}/>
        </TouchableOpacity>
      </ModalView>
    );
  }
}

export default Image;
