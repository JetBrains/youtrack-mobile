/* @flow */
import React, {Component} from 'react';
import {Linking, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Platform} from 'react-native';
import ImageProgress from 'react-native-image-progress';
import flattenStyle from 'react-native/Libraries/StyleSheet/flattenStyle';
import styles from './attachments-row.styles';
import Router from '../../components/router/router';
import safariView from '../../components/safari-view/safari-view';
import {View as AnimatedView} from 'react-native-animatable';

const flatStyles = flattenStyle(styles.attachmentImage) || {};
const imageWidth = flatStyles.width * 2;
const imageHeight = flatStyles.height * 2;
const ANIMATION_DURATION = 700;

type Props = {
  attachments: Array<Object>,
  attachingImage: ?Object,
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any
}

type DefaultProps = {
  imageHeaders: ?Object,
  onOpenAttachment: Function
};

export default class AttachmentsRow extends Component<DefaultProps, Props, void> {
  scrollView: ?ScrollView;

  static defaultProps = {
    imageHeaders: null,
    onOpenAttachment: () => {}
  };

  constructor(...args: Array<any>) {
    super(...args);
  }

  componentWillReceiveProps(props: Props) {
    if (props.attachingImage && props.attachingImage !== this.props.attachingImage) {
      setTimeout(() => this.scrollView && this.scrollView.scrollToEnd());
    }
  }

  _showImageAttachment(currentImage, allAttachments) {
    const {imageHeaders} = this.props;
    const allImagesUrls = allAttachments
      .map(image => image.url);
    this.props.onOpenAttachment('image', currentImage.id);

    return Router.ShowImage({ currentImage: currentImage.url, allImagesUrls, imageHeaders });
  }

  _openAttachmentUrl(name, url) {
    const ATTACH_EXT_BLACK_LIST = [/\.mp4\?/, /\.m4v\?/];
    const isVideo = ATTACH_EXT_BLACK_LIST.some(reg => reg.test(url));
    this.props.onOpenAttachment('file', name);

    if (Platform.OS === 'ios' && !isVideo) {
      Router.AttachmentPreview({url, name});
    } else {
      if (Platform.OS === 'ios') {
        return safariView.show({url});
      }
      Linking.openURL(url);
    }
  }

  setScrollRef = (node: ScrollView) => {
    this.scrollView = node;
  }

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
          const isImage = attach.mimeType ? attach.mimeType.includes('image') : true;
          const isAttachingImage = attachingImage === attach;
          const url = attach.id ? `${attach.url}&w=${imageWidth}&h=${imageHeight}` : attach.url;

          if (isImage) {
            return (
              <TouchableOpacity
                key={attach.url || attach.id}
                onPress={() => this._showImageAttachment(attach, attachments)}
                >
                <AnimatedView
                  animation={isAttachingImage ? 'zoomIn' : null}
                  useNativeDriver
                  duration={ANIMATION_DURATION}
                  easing="ease-out-quart"
                >
                  <ImageProgress
                    style={styles.attachmentImage}
                    renderIndicator={() => <ActivityIndicator/>}
                    source={{uri: url, headers: imageHeaders}}
                  />
                  {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator} />}
                </AnimatedView>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity onPress={() => this._openAttachmentUrl(attach.name, attach.url)} key={attach.id}>
              <View style={styles.attachmentFile}><Text>{attach.name}</Text></View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    );
  }
}
