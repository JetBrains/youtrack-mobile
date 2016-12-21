/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Animated, Image, ActivityIndicator, ScrollView, Platform, Linking} from 'react-native';
import flattenStyle from 'react-native/Libraries/StyleSheet/flattenStyle';
import styles from './attachments-row.styles';
import Router from '../../components/router/router';

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
    if (Platform.OS === 'ios') {
      Router.AttachmentPreview({url, name});
    } else {
      Linking.openURL(url);
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
                  <Image style={styles.attachmentImage}
                    source={{ uri: url }} />
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
