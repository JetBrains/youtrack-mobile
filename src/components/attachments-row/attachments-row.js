/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Animated, ActivityIndicator, ScrollView, Platform} from 'react-native';
import ImageProgress from 'react-native-image-progress';
import flattenStyle from 'react-native/Libraries/StyleSheet/flattenStyle';
import styles from './attachments-row.styles';
import Router from '../../components/router/router';
import safariView from '../../components/safari-view/safari-view';

const flatStyles = flattenStyle(styles.attachmentImage) || {};
const imageWidth = flatStyles.width * 2;
const imageHeight = flatStyles.height * 2;

type Props = {
  attachments: Array<Object>,
  attachingImage: Object,
  onOpenAttachment: (type: string, name: string) => any
}

type State = {
  attachingImageAnimation: Object
};

export default class AttachmentsRow extends Component {
  props: Props;
  state: State;

  state = {
    attachingImageAnimation: new Animated.Value(0),
  };

  static defaultProps = {
    onOpenAttachment: () => {}
  };

  constructor(...args: Array<any>) {
    super(...args);
  }

  componentWillReceiveProps(props: Props) {
    if (props.attachingImage && props.attachingImage !== this.props.attachingImage) {
      this.state.attachingImageAnimation.setValue(0.1);
      Animated.spring(this.state.attachingImageAnimation, {toValue: 1, duration: 2000}).start();
    }
  }

  _showImageAttachment(currentImage, allAttachments) {
    const allImagesUrls = allAttachments
      .map(image => image.url);
    this.props.onOpenAttachment('image', currentImage.id);

    return Router.ShowImage({ currentImage: currentImage.url, allImagesUrls });
  }

  _openAttachmentUrl(name, url) {
    const ATTACH_EXT_BLACK_LIST = [/\.mp4\?/, /\.m4v\?/];
    const isVideo = ATTACH_EXT_BLACK_LIST.some(reg => reg.test(url));

    if (Platform.OS === 'ios' && !isVideo) {
      Router.AttachmentPreview({url, name});
    } else {
      safariView.show({url});
    }
    this.props.onOpenAttachment('file', name);
  }

  render() {
    const {attachments, attachingImage} = this.props;

    if (!attachments.length) {
      return null;
    }

    return (
      <ScrollView style={styles.attachesScroll} horizontal={true}>

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
                <Animated.View style={isAttachingImage ? { transform: [{ scale: this.state.attachingImageAnimation }] } : {}}>
                  <ImageProgress
                    style={styles.attachmentImage}
                    renderIndicator={() => <ActivityIndicator/>}
                    source={{uri: url}}
                  />
                  {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator} />}
                </Animated.View>
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
