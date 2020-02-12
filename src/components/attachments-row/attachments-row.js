/* @flow */

import React, {PureComponent} from 'react';
import {ScrollView} from 'react-native';
import styles from './attachments-row.styles';

import type {Attachment} from '../../flow/CustomFields';
import AttachmentErrorBoundary from './attachment-error-boundary';
import Attach from './attachment';
import {View} from 'react-native-animatable';

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

  setScrollRef = (node: ?ScrollView) => {
    this.scrollView = node;
  };

  render() {
    const {attachments, attachingImage, imageHeaders, onOpenAttachment, onRemoveImage} = this.props;

    if (!attachments.length) {
      return null;
    }

    return <ScrollView
      ref={this.setScrollRef}
      style={styles.attachesScroll}
      horizontal={true}
    >

      {attachments.map((attach: Attachment) => (
        <View key={attach.id}>
          <AttachmentErrorBoundary
            attachName={attach.name}
          >
            <Attach
              attach={attach}
              attachments={attachments}
              attachingImage={attachingImage}
              imageHeaders={imageHeaders}
              onOpenAttachment={onOpenAttachment}
              onRemoveImage={onRemoveImage}
            />
          </AttachmentErrorBoundary>
        </View>
      ))}
    </ScrollView>;
  }
}
