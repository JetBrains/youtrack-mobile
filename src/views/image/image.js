/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';

import {SvgFromUri} from 'react-native-svg';

import Gallery from 'react-native-image-gallery';
import Header from '../../components/header/header';
import ImageProgress from 'react-native-image-progress';
import Router from '../../components/router/router';
import {hasMimeType} from '../../components/mime-type/mime-type';
import {IconClose} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';

import styles from './image.styles';

import type {Attachment} from '../../flow/CustomFields';
import type {Node} from 'React';

type ImageSource = {
  id: string,
  uri: string,
  headers: Object,
  mimeType: string,
}

type Props = {
  imageAttachments: Array<Attachment>,
  current: Attachment,
  imageHeaders: ?Object,
  onRemoveImage?: (index: number) => any
}

const ImagePreview = (props: Props): Node => {
  // eslint-disable-next-line no-unused-vars
  const [index, updateCurrentIndex] = useState(0);

  const closeView: any = () => Router.pop(true);

  const getCurrentIndex: (attachment: Attachment) => number = useCallback((attachment: Attachment): number => (
    props.imageAttachments.findIndex(
      (it: Attachment) => it.id === attachment.id) || 0
  ), [props.imageAttachments]);

  useEffect(() => {
    updateCurrentIndex({index: getCurrentIndex(props.current)});
  }, [getCurrentIndex, props]);

  const renderImage: ((imageProps: any) => Node) = (imageProps: { source: Attachment }) => {
    const attach: Attachment = imageProps.source && props.imageAttachments[getCurrentIndex(imageProps.source)];
    return hasMimeType.svg(attach)
      ? (<SvgFromUri
        width="100%"
        height="100%"
        uri={attach.url}
      />)
      : (<ImageProgress
        renderIndicator={() => <ActivityIndicator color={styles.loader.color} style={styles.loader}/>}
        onError={() => notify('Failed to load image')}
        {...imageProps}
      />);

  };

  const createSource = (attach: Attachment): { source: ImageSource } => ({
    source: {
      id: attach.id,
      uri: attach.url,
      headers: props.imageHeaders,
      mimeType: attach.mimeType,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        leftButton={<IconClose size={21} color={styles.link.color}/>}
        onBack={closeView}
      />

      <Gallery
        style={styles.container}
        images={props.imageAttachments.map(createSource)}
        initialPage={getCurrentIndex(props.current)}
        imageComponent={renderImage}
        onPageSelected={updateCurrentIndex}
        pageMargin={1}
      />
    </View>
  );
};


export default (React.memo<Props>(ImagePreview): React$AbstractComponent<Props, mixed>);
