/* @flow */
import React, {PureComponent} from 'react';
import {Linking, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Platform} from 'react-native';
import ImageProgress from 'react-native-image-progress';
import throttle from 'lodash.throttle';
import styles from './attachments-row.styles';
import Router from '../../components/router/router';
import safariView from '../../components/safari-view/safari-view';
import {View as AnimatedView} from 'react-native-animatable';
import {SvgUri} from 'react-native-svg';
import {hasMimeType} from '../../components/mime-type/mime-type';

import type {Attachment} from '../../flow/CustomFields';

const ANIMATION_DURATION = 700;
const ERROR_HANLDER_THROTTLE = 60 * 1000;

type DefaultProps = {
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any,
  onImageLoadingError: (error: Object) => any
};

type Props = DefaultProps & {
  attachments: Array<Attachment>,
  attachingImage: ?Object,
  onRemoveImage?: (attachment: Attachment) => any
}


export default class AttachmentsRow extends PureComponent<Props, void> {
  scrollView: ?ScrollView;

  static defaultProps: DefaultProps = {
    imageHeaders: null,
    onOpenAttachment: () => {},
    onImageLoadingError: () => {}
  };

  constructor(...args: Array<any>) {
    super(...args);
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (props.attachingImage && props.attachingImage !== this.props.attachingImage) {
      setTimeout(() => this.scrollView && this.scrollView.scrollToEnd());
    }
  }

  handleLoadError = throttle((err) => {
    this.props.onImageLoadingError(err);
  }, ERROR_HANLDER_THROTTLE);

  _showImageAttachment(attach: Attachment, attachments: Array<Attachment>) {
    const {imageHeaders, onRemoveImage} = this.props;
    this.props.onOpenAttachment('image', attach.id);

    if (Platform.OS !== 'ios' && hasMimeType.svg(attach)) {
      return this._openAttachmentUrl(attach.name, attach.url);
    }

    return Router.ShowImage({
      imageAttachments: attachments.filter(attach => hasMimeType.previewable(attach)),
      current: attach,
      imageHeaders,
      ...(onRemoveImage ? {onRemoveImage: (currentPage: number) => onRemoveImage(attachments[currentPage])} : {})
    });
  }

  _openAttachmentUrl(name, url) {
    const ATTACH_EXT_BLACK_LIST = [/\.mp4\?/, /\.m4v\?/];
    const isVideo = ATTACH_EXT_BLACK_LIST.some(reg => reg.test(url));
    this.props.onOpenAttachment('file', name);

    if (Platform.OS === 'ios' && !isVideo) {
      Router.AttachmentPreview({url, name, headers: this.props.imageHeaders});
    } else {
      if (Platform.OS === 'ios') {
        return safariView.show({url});
      }
      Linking.openURL(url);
    }
  }

  setScrollRef = (node: ?ScrollView) => {
    this.scrollView = node;
  };

  render() {
    const {attachments, attachingImage, imageHeaders} = this.props;

    if (!attachments.length) {
      return null;
    }

    return (
      <ScrollView
        ref={this.setScrollRef}
        style={styles.attachesScroll}
        horizontal={true}
      >

        {attachments.map(attach => {
          const isImage = hasMimeType.image(attach);
          const isSvg = hasMimeType.svg(attach);
          const isAttachingImage = attachingImage === attach;

          if (isImage || isSvg) {
            return (
              <TouchableOpacity
                key={attach.id}
                onPress={() => this._showImageAttachment(attach, attachments)}
              >
                {isSvg && <View style={styles.attachmentImage}>
                  <SvgUri
                    width="100%"
                    height="100%"
                    uri={attach.thumbnailURL}
                  />
                </View>}

                {Boolean(isImage && !isSvg) && <AnimatedView
                  animation={isAttachingImage ? 'zoomIn' : null}
                  useNativeDriver
                  duration={ANIMATION_DURATION}
                  easing="ease-out-quart"
                >
                  <ImageProgress
                    style={styles.attachmentImage}
                    renderIndicator={() => <ActivityIndicator/>}
                    source={{uri: attach.thumbnailURL, headers: imageHeaders}}
                    onError={this.handleLoadError}
                  />
                  {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator}/>}
                </AnimatedView>}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity onPress={() => this._openAttachmentUrl(attach.name, attach.url)} key={attach.id}>
              <View style={[styles.attachmentImage, styles.attachmentFile]}><Text>{attach.name}</Text></View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    );
  }
}
