/* @flow */

import React, {PureComponent} from 'react';
import {View, ActivityIndicator, TouchableOpacity, Text, Alert} from 'react-native';

import debounce from 'lodash.debounce';
import {SvgUri} from 'react-native-svg';

import ImageWithProgress from '../image/image-with-progress';
import ModalPortal from '../modal-view/modal-portal';
import PreviewFile from 'views/preview-file/preview-file';
import Router from '../router/router';
import {attachmentCategories} from './attachment-helper';
import {hasMimeType} from '../mime-type/mime-type';
import {HIT_SLOP} from '../common-styles/button';
import {IconRemoveFilled} from '../icon/icon';
import {isAndroidPlatform} from 'util/util';
import {isSplitView} from '../responsive/responsive-helper';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './attachments-row.styles';

import type {Attachment} from 'flow/CustomFields';
import type {FileCategoryKey} from './attachment-helper';
import type {Node} from 'react';
import type {UITheme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type StyleMap = { [FileCategoryKey]: ViewStyleProp };

type Props = {
  imageHeaders: ?Object,
  onOpenAttachment: (type: string, name: string) => any,
  onImageLoadingError: (error: Object) => any,
  canRemoveImage?: boolean,
  userCanRemoveImage?: (attachment: Attachment) => boolean,
  onRemoveImage: (attachment: Attachment) => any,
  attach: Attachment,
  attachments: Array<Attachment>,
  attachingImage: ?Object,
  uiTheme: UITheme
}

type State = {
  isRemoving: boolean,
  modalChildren: any,
}

const ANIMATION_DURATION: number = 700;
const isAndroid: boolean = isAndroidPlatform();

export default class Attach extends PureComponent<Props, State> {
  static defaultProps: $Shape<Props> = {
    imageHeaders: null,
    canRemoveImage: false,
    onOpenAttachment: () => {},
    onImageLoadingError: () => {},
    onRemoveImage: () => {},
  };

  thumbStyleMap: StyleMap = {
    default: styles.attachmentDefault,
    sheet: styles.attachmentSheet,
    sketch: styles.attachmentSketch,
    text: styles.attachmentDoc,
    video: styles.attachmentMedia,
    audio: styles.attachmentMedia,
  };
  _isUnmounted: boolean;
  handleLoadError: any = debounce((err) => {
    this.props.onImageLoadingError(err);
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
    this.setState({modalChildren});
  }

  showImageAttachment(attach: Attachment): any | void | Promise<null> {
    this.props.onOpenAttachment('image', attach.id);

    if (isAndroid && hasMimeType.svg(attach)) {
      return this.openAttachmentUrl(attach.name, attach.url);
    }

    this.doPreview();
  }

  doPreview: () => void = (): void => {
    const {attach, attachments, onRemoveImage, imageHeaders} = this.props;
    if (isSplitView()) {
      this.toggleModalChildren(
        <PreviewFile
          current={attach}
          imageAttachments={this.isMedia() ? undefined : [attach]}
          imageHeaders={imageHeaders}
          onRemoveImage={onRemoveImage ? () => onRemoveImage(attach) : undefined}
          onHide={() => this.toggleModalChildren()}
        />
      );
    } else {
      Router.PreviewFile({
        current: attach,
        imageAttachments: this.isMedia() ? undefined : attachments.filter((it: Attachment) => hasMimeType.previewable(it)),
        imageHeaders,
        onRemoveImage: onRemoveImage ? () => onRemoveImage(attach) : undefined,
      });
    }
  };

  openAttachmentUrl(name: string, url: string): void | Promise<null> {
    this.props.onOpenAttachment('file', name);
    Router.AttachmentPreview({
      url,
      name,
      headers: this.props.imageHeaders,
    });
  }

  renderSVG(): Node {
    return (
      <View
        testID="attachmentSvg"
        style={styles.attachmentThumbContainer}
      >
        <SvgUri
          width="100%"
          height="100%"
          uri={this.props.attach.thumbnailURL}
        />
      </View>
    );
  }

  renderThumb(fileTypeStyle: ViewStyleProp & Object = {}, testId: string = 'attachmentFile'): Node {
    const {attach} = this.props;
    return (
      <View
        testID={testId}
        style={[styles.attachmentThumbContainer, fileTypeStyle]}
      >
        <View style={styles.attachmentTypeContainer}>
          <View style={[styles.attachmentType, {backgroundColor: fileTypeStyle?.color}]}>
            <Text numberOfLines={1} style={styles.attachmentText}>
              {attach.name.split('.').pop() || attach.name}
            </Text>
          </View>
        </View>

        <View style={styles.attachmentName}>
          <Text numberOfLines={2} style={styles.attachmentFileText}>{attach.name}</Text>
        </View>
      </View>
    );
  }

  renderImage(): null | Node {
    const {attachingImage, imageHeaders, attach} = this.props;
    const isAttachingImage = attachingImage === attach;

    const source = {
      uri: attach?.thumbnailURL || (attach?.url ? `${attach.url}&w=126&h=80` : ''),
      headers: imageHeaders,
    };
    if (!source.uri) {
      return null;
    }

    return (
      <AnimatedView
        testID="attachmentImage"
        animation={isAttachingImage ? 'zoomIn' : null}
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
              <Text numberOfLines={2} style={styles.attachmentFileText}>{attach.name}</Text>
            </View>
          )}
         />
        {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator}/>}
      </AnimatedView>
    );
  }

  renderFile(): Node {
    const {attach} = this.props;
    const fileExt: ?string = attach.name.split('.').pop();
    let thumbStyle: ViewStyleProp = this.thumbStyleMap.default;

    for (const key in attachmentCategories) {
      const isCategory: boolean = attachmentCategories[(key: any)].split(' ').some((it: string) => it === fileExt);
      if (isCategory) {
        thumbStyle = this.thumbStyleMap[(key: any)];
        break;
      }
    }
    return this.renderThumb(thumbStyle);
  }

  remove: (() => void) = () => {
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
            this.setState({isRemoving: true});
            await this.props.onRemoveImage(this.props.attach);
            if (!this._isUnmounted) {
              this.setState({isRemoving: false});
            }
          },
        },
      ],
      {cancelable: true}
    );
  };

  onAttachPress: (() => void) = () => {
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
    return hasMimeType.video(this.props.attach) || hasMimeType.audio(this.props.attach);
  }

  canRemove(): boolean {
    if (this.props.userCanRemoveImage) {
      return this.props.userCanRemoveImage(this.props.attach);
    }
    return !!this.props.canRemoveImage;
  }

  renderAttach(): Node {
    if (this.isMedia()) {
      return this.renderThumb(styles.attachmentMedia, 'attachmentMedia');
    } else if (this.isSVG()) {
      return this.renderSVG();
    } else if (this.isImage()) {
      return this.renderImage();
    }
    return this.renderFile();
  }

  render(): Node {
    const {attach, uiTheme} = this.props;
    const {modalChildren} = this.state;

    return (
      <View
        key={attach.id}
        style={this.state.isRemoving ? styles.removingAttach : null}
      >
        <TouchableOpacity
          testID="attachment"
          onPress={this.onAttachPress}
        >
          {this.renderAttach()}
        </TouchableOpacity>

        {this.state.isRemoving && <ActivityIndicator style={styles.removeButton} color={uiTheme.colors.$link}/>}
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
              color={this.state.isRemoving ? uiTheme.colors.$disabled : uiTheme.colors.$link}
            />

          </TouchableOpacity>
        )}
        {isSplitView() && (
          <ModalPortal
            fullscreen={true}
            onHide={() => this.toggleModalChildren()}
          >
            {modalChildren}
          </ModalPortal>
        )}
      </View>
    );
  }
}
