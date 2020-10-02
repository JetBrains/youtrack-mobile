/* @flow */

import React, {PureComponent} from 'react';
import {ScrollView} from 'react-native';
import styles from './attachments-row.styles';

import type {Attachment} from '../../flow/CustomFields';
import AttachmentErrorBoundary from './attachment-error-boundary';
import Attach from './attachment';
import {View} from 'react-native-animatable';
import type {UITheme} from '../../flow/Theme';

type DefaultProps = {
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any,
  onImageLoadingError: (error: Object) => any
};

type Props = DefaultProps & {
  attachments: Array<Attachment>,
  attachingImage: ?Object,
  canRemoveAttachment?: boolean,
  onRemoveImage?: (attachment: Attachment) => any,
  uiTheme: UITheme
}


export default class AttachmentsRow extends PureComponent<Props, void> {
  scrollView: ?ScrollView;

  static defaultProps: DefaultProps = {
    imageHeaders: null,
    canRemoveAttachment: false,
    onOpenAttachment: () => {},
    onImageLoadingError: () => {},
    onRemoveImage: () => {}
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
    const {attachments, attachingImage, imageHeaders, onOpenAttachment, onRemoveImage, canRemoveAttachment, uiTheme} = this.props;

    if (!attachments.length) {
      return null;
    }

    return <ScrollView
      ref={this.setScrollRef}
      style={styles.attachesScroll}
      horizontal={true}
    >

      {attachments.map((attach: Attachment, index: number) => (
        <View key={attach.id || `issue-attachment-${index}`}>
          <AttachmentErrorBoundary
            attachName={attach.name}
          >
            <Attach
              attach={attach}
              attachments={attachments}
              attachingImage={attachingImage}
              imageHeaders={imageHeaders}
              onOpenAttachment={onOpenAttachment}
              canRemoveImage={canRemoveAttachment}
              onRemoveImage={onRemoveImage}
              uiTheme={uiTheme}
            />
          </AttachmentErrorBoundary>
        </View>
      ))}
    </ScrollView>;
  }
}
