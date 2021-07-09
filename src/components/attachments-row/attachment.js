/* @flow */

import React, {PureComponent} from 'react';
import {View, ActivityIndicator, TouchableOpacity, Text, Alert} from 'react-native';

import debounce from 'lodash.debounce';
import ImageProgress from 'react-native-image-progress';
import {SvgUri} from 'react-native-svg';

import Router from '../router/router';
import {hasMimeType} from '../mime-type/mime-type';
import {HIT_SLOP} from '../common-styles/button';
import {IconRemoveFilled} from '../icon/icon';
import {isAndroidPlatform} from '../../util/util';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './attachments-row.styles';

import type {Attachment} from '../../flow/CustomFields';
import type {Node} from 'React';
import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

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
  isRemoving: boolean
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
  _isUnmounted: boolean;
  handleLoadError: any = debounce((err) => {
    this.props.onImageLoadingError(err);
  }, 60 * 1000);

  state: State = {isRemoving: false};

  componentDidMount() {
    this._isUnmounted = false;
  }

  componentWillUnmount() {
    this._isUnmounted = true;
  }

  showImageAttachment(attach: Attachment): any | void | Promise<null> {
    const {imageHeaders, onRemoveImage, attachments = [attach]} = this.props;

    this.props.onOpenAttachment('image', attach.id);

    if (isAndroid && hasMimeType.svg(attach)) {
      return this.openAttachmentUrl(attach.name, attach.url);
    }

    return Router.Image({
      imageAttachments: attachments.filter((it: Attachment) => hasMimeType.previewable(it)),
      current: attach,
      imageHeaders,
      ...(onRemoveImage ? {onRemoveImage: (currentPage: number) => onRemoveImage(attachments[currentPage])} : {}),
    });
  }

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
        style={styles.attachmentImage}
      >
        <SvgUri
          width="100%"
          height="100%"
          uri={this.props.attach.thumbnailURL}
        />
      </View>
    );
  }

  renderThumb(fileTypeStyle: ViewStyleProp = null): Node {
    const {attach} = this.props;
    return (
      <View
        style={[styles.attachmentImage, fileTypeStyle]}
      >
        <View style={styles.attachmentType}>
          <View style={styles.attachmentText}>
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
        useNativeDriver
        duration={ANIMATION_DURATION}
        easing="ease-out-quart"
      >
        <ImageProgress
          style={styles.attachmentImage}
          renderIndicator={() => <ActivityIndicator/>}
          source={source}
          onError={this.handleLoadError}
        />
        {isAttachingImage && <ActivityIndicator size="large" style={styles.imageActivityIndicator}/>}
      </AnimatedView>
    );
  }

  renderFile(): Node {
    const {attach} = this.props;

    return (
      <View
        testID="attachmentFile"
        style={[styles.attachmentImage, styles.attachmentFile]}
      >
        <Text style={styles.attachmentFileText}>{attach.name}</Text>
      </View>
    );
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
    const {imageHeaders, attach, onRemoveImage} = this.props;
    if (this.isVideo()) {
      Router.Image({
        current: attach,
        imageHeaders,
        onRemoveImage: () => onRemoveImage(attach),
      });
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

  isVideo(): boolean {
    return hasMimeType.video(this.props.attach);
  }

  canRemove(): boolean {
    if (this.props.userCanRemoveImage) {
      return this.props.userCanRemoveImage(this.props.attach);
    }
    return !!this.props.canRemoveImage;
  }

  renderAttach(): Node {
    if (this.isVideo()) {
      return this.renderThumb(styles.attachmentVideo);
    } else if (this.isSVG()) {
      return this.renderSVG();
    } else if (this.isImage()) {
      return this.renderImage();
    }
    return this.renderFile();
  }

  render(): Node {
    const {attach, uiTheme} = this.props;

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
      </View>
    );
  }
}
