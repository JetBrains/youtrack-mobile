import React, {PureComponent} from 'react';
import {ScrollView} from 'react-native';
import styles from './attachments-row.styles';
import Attach from './attachment';
import AttachmentErrorBoundary from './attachment-error-boundary';
import {getApi} from '../api/api__instance';
import {View} from 'react-native-animatable';
import type {Attachment} from 'types/CustomFields';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  attachingImage: Record<string, any> | null | undefined;
  attachments: Attachment[];
  canRemoveAttachment?: boolean;
  onOpenAttachment: (type: string, name: string) => any;
  onImageLoadingError: (error: any) => any;
  imageHeaders?: Record<string, any> | null;
  userCanRemoveAttachment?: (attachment: Attachment) => any;
  onRemoveImage?: (attachment: Attachment) => any;
  style?: ViewStyleProp | ViewStyleProp[];
  uiTheme: UITheme;
};
export default class AttachmentsRow extends PureComponent<Props, Readonly<{}>> {
  scrollView: any;
  static defaultProps: Partial<Props> = {
    attachments: [],
    attachingImage: null,
    imageHeaders: null,
    canRemoveAttachment: false,
    onOpenAttachment: () => {},
    onRemoveImage: () => {},
  };

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (
      props.attachingImage &&
      props.attachingImage !== this.props.attachingImage
    ) {
      setTimeout(() => this.scrollView && this.scrollView.scrollToEnd());
    }
  }

  getHeaders: () =>
    | any
    | void
    | {
        Authorization: string;
        'User-Agent': string;
      } = () => {
    if (this.props.imageHeaders) {
      return this.props.imageHeaders;
    }

    let authorizationHeaders = null;

    try {
      authorizationHeaders = getApi().auth.getAuthorizationHeaders();
    } catch (e) {}

    return authorizationHeaders;
  };

  render(): React.ReactNode {
    const {
      attachments,
      attachingImage,
      onOpenAttachment,
      onRemoveImage,
      canRemoveAttachment,
      userCanRemoveAttachment,
      uiTheme,
      style,
    } = this.props;

    if (!attachments.length) {
      return null;
    }

    return (
      <ScrollView
        ref={(node: any): void => {
          this.scrollView = node;
        }}
        style={[styles.attachesScroll, style]}
        horizontal={true}
      >
        {attachments.map((attach: Attachment, index: number) => (
          <View key={attach.id || `issue-attachment-${index}`}>
            <AttachmentErrorBoundary attachName={attach.name}>
              <Attach
                attach={attach}
                attachments={attachments}
                attachingImage={attachingImage}
                imageHeaders={this.getHeaders()}
                onOpenAttachment={onOpenAttachment}
                canRemoveImage={canRemoveAttachment}
                userCanRemoveImage={userCanRemoveAttachment}
                onRemoveImage={onRemoveImage}
                uiTheme={uiTheme}
              />
            </AttachmentErrorBoundary>
          </View>
        ))}
      </ScrollView>
    );
  }
}
