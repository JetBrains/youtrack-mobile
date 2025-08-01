import React, {PureComponent} from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';

import debounce from 'lodash.debounce';
import {SvgUri} from 'react-native-svg';
import {View as AnimatedView} from 'react-native-animatable';

import FileThumb from 'components/attachments-row/attachment-thumbnail';
import ImageWithProgress from 'components/image/image-with-progress';
import ModalPortal from 'components/modal-view/modal-portal';
import PreviewFile from 'views/preview-file/preview-file';
import Router from 'components/router/router';
import {hasMimeType} from 'components/mime-type/mime-type';
import {HIT_SLOP} from 'components/common-styles/button';
import {IconRemoveFilled} from 'components/icon/icon';
import {isAndroidPlatform} from 'util/util';

import styles from './attachments-row.styles';

import type {Attachment} from 'types/CustomFields';
import type {FileCategoryKey} from './attachment-helper';
import type {RequestHeaders} from 'types/Auth';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';


type StyleMap = Record<FileCategoryKey, ViewStyleProp>;

type Props = {
  imageHeaders?: RequestHeaders;
  onOpenAttachment?: (type: string, name: string) => any;
  onImageLoadingError?: (error: Record<string, any>) => any;
  canRemoveImage?: boolean;
  userCanRemoveImage?: (attachment: Attachment) => boolean;
  onRemoveImage?: (attachment: Attachment) => void;
  attach: Attachment;
  attachments: Attachment[];
  attachingImage: Record<string, any> | null | undefined;
  uiTheme: UITheme;
};
type State = {
  isRemoving: boolean;
  modalChildren: any;
};
const ANIMATION_DURATION: number = 700;
const isAndroid: boolean = isAndroidPlatform();

export default class Attach extends PureComponent<Props, State> {
  thumbStyleMap: StyleMap = {
    default: styles.attachmentDefault,
    sheet: styles.attachmentSheet,
    sketch: styles.attachmentSketch,
    text: styles.attachmentDoc,
    pdf: styles.attachmentPdf,
    video: styles.attachmentMedia,
    audio: styles.attachmentMedia,
  };
  _isUnmounted: boolean = false;
  handleLoadError: any = debounce(err => {
    this.props.onImageLoadingError?.(err);
  }, 60 * 1000);
  state: State = {
    isRemoving: false,
    modalChildren: null,
  };

  componentDidMount() {
    this._isUnmounted = false;
  }

  componentWillUnmount() {
    this._isUnmounted = true;
  }

  toggleModalChildren(modalChildren: any = null) {
    this.setState({
      modalChildren,
    });
  }

  showImageAttachment(attach: Attachment) {
    this.props.onOpenAttachment?.('image', attach.id);

    if (isAndroid && hasMimeType.svg(attach)) {
      return this.openAttachmentUrl(attach.name, attach.url);
    }

    this.doPreview();
  }

  doPreview = () => {
    const {attach, attachments, onRemoveImage, imageHeaders} = this.props;
    this.toggleModalChildren(
      <PreviewFile
        file={attach}
        files={attachments}
        imageHeaders={imageHeaders}
        onRemove={onRemoveImage ? () => onRemoveImage(attach) : undefined}
        onHide={() => this.toggleModalChildren()}
      />
    );
  };

  openAttachmentUrl(name: string, url: string) {
    this.props.onOpenAttachment?.('file', name);
    Router.AttachmentPreview({
      url,
      name,
      headers: this.props.imageHeaders,
    });
  }

  renderSVG() {
    return (
      <View testID="attachmentSvg" style={styles.attachmentThumbContainer}>
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
    const source = {
      uri:
        attach?.thumbnailURL || (attach?.url ? `${attach.url}&w=126&h=80` : ''),
      headers: imageHeaders,
    };

    if (!source.uri) {
      return null;
    }

    return (
      <AnimatedView
        testID="attachmentImage"
        animation={isAttachingImage ? 'zoomIn' : ''}
        useNativeDriver={true}
        duration={ANIMATION_DURATION}
        easing="ease-out-quart"
      >
        <ImageWithProgress
          style={[styles.attachmentThumbContainer, this.thumbStyleMap.default]}
          source={source}
          onError={this.handleLoadError}
          renderError={() => (
            <View style={styles.attachmentName}>
              <Text numberOfLines={2} style={styles.attachmentFileText}>
                {attach.name}
              </Text>
            </View>
          )}
        />
        {isAttachingImage && (
          <ActivityIndicator
            size="large"
            style={styles.imageActivityIndicator}
          />
        )}
      </AnimatedView>
    );
  }

  remove = () => {
    Alert.alert(
      'Delete attachment?',
      'This action deletes the attachment permanently and cannot be undone.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            this.setState({
              isRemoving: true,
            });
            if (this.props.onRemoveImage) {
              await this.props.onRemoveImage(this.props.attach);
            }

            if (!this._isUnmounted) {
              this.setState({
                isRemoving: false,
              });
            }
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  onAttachPress = () => {
    const {attach} = this.props;

    if (this.isMedia()) {
      this.doPreview();
    } else if (this.isImage() || this.isSVG()) {
      this.showImageAttachment(attach);
    } else {
      this.openAttachmentUrl(attach.name, attach.url);
    }
  };

  isImage(): boolean {
    return hasMimeType.image(this.props.attach);
  }

  isSVG(): boolean {
    return hasMimeType.svg(this.props.attach);
  }

  isMedia(): boolean {
    return (
      hasMimeType.video(this.props.attach) ||
      hasMimeType.audio(this.props.attach)
    );
  }

  canRemove(): boolean {
    if (this.props.userCanRemoveImage) {
      return this.props.userCanRemoveImage(this.props.attach);
    }

    return !!this.props.canRemoveImage;
  }

  renderAttach() {
    if (this.isMedia()) {
      return <FileThumb attach={this.props.attach} testID="attachmentMedia"/>;
    } else if (this.isSVG()) {
      return this.renderSVG();
    } else if (this.isImage()) {
      return this.renderImage();
    }

    return <FileThumb attach={this.props.attach}/>;
  }

  render() {
    const {attach, uiTheme} = this.props;
    const {modalChildren} = this.state;
    return (
      <View
        key={attach.id}
        style={this.state.isRemoving ? styles.removingAttach : null}
      >
        <TouchableOpacity testID="attachment" onPress={this.onAttachPress}>
          {this.renderAttach()}
        </TouchableOpacity>

        {this.state.isRemoving && (
          <ActivityIndicator
            style={styles.removeButton}
            color={uiTheme.colors.$link}
          />
        )}
        {!this.state.isRemoving && this.canRemove() && (
          <TouchableOpacity
            style={styles.removeButton}
            hitSlop={HIT_SLOP}
            disabled={this.state.isRemoving}
            testID="attachmentRemove"
            onPress={this.remove}
          >
            <IconRemoveFilled
              size={24}
              color={
                this.state.isRemoving
                  ? uiTheme.colors.$disabled
                  : uiTheme.colors.$link
              }
            />
          </TouchableOpacity>
        )}
        <ModalPortal fullscreen onHide={() => this.toggleModalChildren()}>{modalChildren}</ModalPortal>
      </View>
    );
  }
}
