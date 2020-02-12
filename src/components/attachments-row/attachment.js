/* @flow */

import React, {PureComponent} from 'react';
import {View, ActivityIndicator, TouchableOpacity, Text, Platform, Linking} from 'react-native';
import {SvgUri} from 'react-native-svg';

import {View as AnimatedView} from 'react-native-animatable';
import {hasMimeType} from '../mime-type/mime-type';
import ImageProgress from 'react-native-image-progress';
import Router from '../router/router';
import safariView from '../safari-view/safari-view';
import throttle from 'lodash.throttle';

import styles from './attachments-row.styles';

import type {Attachment} from '../../flow/CustomFields';

type Props = {
  attach: Attachment,
  attachments: Array<Attachment>,
  attachingImage: ?Object,
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any,
  onImageLoadingError: (error: Object) => any,
  onRemoveImage?: (attachment: Attachment) => any
}

type DefaultProps = {
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any,
  onImageLoadingError: (error: Object) => any
};

const ANIMATION_DURATION = 700;
const ERROR_HANDLER_THROTTLE = 60 * 1000;

export default class Attach extends PureComponent<Props, void> {

  static defaultProps: DefaultProps = {
    imageHeaders: null,
    onOpenAttachment: () => {},
    onImageLoadingError: () => {}
  };

  handleLoadError = throttle((err) => {
    this.props.onImageLoadingError(err);
  }, ERROR_HANDLER_THROTTLE);

  showImageAttachment(attach: Attachment) {
    const {imageHeaders, onRemoveImage, attachments = [attach]} = this.props;

    this.props.onOpenAttachment('image', attach.id);

    if (Platform.OS !== 'ios' && hasMimeType.svg(attach)) {
      return this.openAttachmentUrl(attach.name, attach.url);
    }

    return Router.ShowImage({
      imageAttachments: attachments.filter(attach => hasMimeType.previewable(attach)),
      current: attach,
      imageHeaders,
      ...(onRemoveImage ? {onRemoveImage: (currentPage: number) => onRemoveImage(attachments[currentPage])} : {})
    });
  }

  openAttachmentUrl(name: string, url: string) {
    const ATTACH_EXT_BLACK_LIST = [/\.mp4\?/, /\.m4v\?/];
    const isVideo = ATTACH_EXT_BLACK_LIST.some(reg => reg.test(url));
    this.props.onOpenAttachment('file', name);

    if (Platform.OS === 'ios' && !isVideo) {
      Router.AttachmentPreview({
        url,
        name,
        headers: this.props.imageHeaders
      });
    } else {
      if (Platform.OS === 'ios') {
        return safariView.show({url});
      }
      Linking.openURL(url);
    }
  }

  renderSVG() {
    return (
      <View
        testID="attachmentSvg"
        style={styles.attachmentImage}>
        <SvgUri
          width="100%"
          height="100%"
          uri={this.props.attach.thumbnailURL}
        />
      </View>
    );
  }

  renderImage() {
    const {attachingImage, imageHeaders, attach} = this.props;
    const isAttachingImage = attachingImage === attach;

    return (
      <AnimatedView
        testID="attachmentImage"
        animation={isAttachingImage ? 'zoomIn' : null}
        useNativeDriver
        duration={ANIMATION_DURATION}
        easing="ease-out-quart"
      >
        <ImageProgress
          style={styles.attachmentImage}
          renderIndicator={() => <ActivityIndicator/>}
          source={{
            uri: attach.thumbnailURL,
            headers: imageHeaders
          }}
          onError={this.handleLoadError}
        />
        {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator}/>}
      </AnimatedView>
    );
  }

  renderFile() {
    const {attach} = this.props;

    return (
      <View
        testID="attachmentFile"
        style={[styles.attachmentImage, styles.attachmentFile]}
      >
        <Text>{attach.name}</Text>
      </View>
    );
  }

  render() {
    const {attach} = this.props;

    const isImage = hasMimeType.image(attach);
    const isSvg = hasMimeType.svg(attach);

    const onPress = (
      (isImage || isSvg)
        ? () => this.showImageAttachment(attach)
        : () => this.openAttachmentUrl(attach.name, attach.url)
    );

    return (
      <TouchableOpacity
        key={attach.id}
        testID="attachment"
        onPress={onPress}
      >
        {isSvg && this.renderSVG()}
        {Boolean(isImage && !isSvg) && this.renderImage()}
        {Boolean(!isImage && !isSvg) && this.renderFile()}

      </TouchableOpacity>
    );
  }
}
