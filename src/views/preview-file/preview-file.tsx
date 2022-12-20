import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Gallery from 'react-native-image-gallery';
import Video from 'react-native-video';
import {SvgFromUri} from 'react-native-svg';
import {View as AnimatedView} from 'react-native-animatable';
import Header from 'components/header/header';
import ImageWithProgress from 'components/image/image-with-progress';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_PREVIEW_PAGE} from 'components/analytics/analytics-ids';
import {hasMimeType} from 'components/mime-type/mime-type';
import {IconClose} from 'components/icon/icon';
import {IconNoProjectFound} from 'components/icon/icon-pictogram';
import {isAndroidPlatform} from 'util/util';
import {logEvent} from 'components/log/log-helper';
import styles from './preview-file.styles';
import type {Attachment} from 'types/CustomFields';
type FileSource = {
  id: string;
  uri: string;
  headers: Record<string, any>;
  mimeType: string;
};
type Props = {
  imageAttachments: Attachment[];
  current: Attachment;
  imageHeaders: Record<string, any> | null | undefined;
  onRemoveImage?: (index: number) => any;
  onHide?: () => any;
};
const isAndroid: boolean = isAndroidPlatform();
const ERROR_MESSAGE: string = 'Cannot load a preview';
type VideoError = {
  error: {
    code: number;
    domain: string;
    localizedDescription: string;
    localizedFailureReason: string;
    localizedRecoverySuggestion: string;
  };
};

const ImagePreview = (props: Props): React.ReactNode => {
  const [index, updateCurrentIndex] = useState(0);
  const [error, updateError] = useState(null);
  const [isLoading, updateIsLoading] = useState(false);

  const closeView = (): void => {
    if (props.onHide) {
      props.onHide();
    } else {
      Router.pop(true);
    }
  };

  const getCurrentIndex: (attachment: Attachment) => number = useCallback(
    (attachment: Attachment): number =>
      props.imageAttachments.findIndex(
        (it: Attachment) => it.id === attachment.id,
      ) || 0,
    [props.imageAttachments],
  );
  useEffect(() => {
    updateError(null);
    updateIsLoading(false);

    if (props.imageAttachments) {
      updateCurrentIndex(getCurrentIndex(props.current));
    }
  }, [getCurrentIndex, props]);

  const renderLoader = (): React.ReactElement<
    React.ComponentProps<typeof ActivityIndicator>,
    typeof ActivityIndicator
  > => <ActivityIndicator color={styles.loader.color} style={styles.loader} />;

  const renderImage: (imageProps: any)=> React.ReactNode = (imageProps: {
    source: Attachment;
  }): React.ReactNode => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Open image');

    if (error) {
      return renderError();
    }

    const attach: Attachment =
      imageProps.source &&
      props.imageAttachments[getCurrentIndex(imageProps.source)];
    return hasMimeType.svg(attach) ? (
      <SvgFromUri width="100%" height="100%" uri={attach.url} />
    ) : (
      <ImageWithProgress
        renderError={renderError}
        {...imageProps}
        imageStyle={[
          styles.preview,
          attach.imageDimensions
            ? {
                width: attach.imageDimensions.width,
                height: attach.imageDimensions.height,
              }
            : {},
        ]}
      />
    );
  };

  const createSource = (
    attach: Attachment,
  ): {
    source: FileSource;
  } => ({
    source: {
      id: attach.id,
      uri: attach.url,
      headers: props.imageHeaders,
      mimeType: attach.mimeType,
    },
  });

  const renderVideo = (): React.ReactElement<
    React.ComponentProps<typeof Video>,
    typeof Video
  > => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Open video');
    return (
      <Video
        controls={true}
        fullscreen={false}
        headers={props.imageHeaders}
        onLoad={() => updateIsLoading(false)}
        onLoadStart={() => updateIsLoading(true)}
        onReadyForDisplay={() => updateIsLoading(false)}
        onError={(onError: VideoError) => {
          updateIsLoading(false);
          const message: string =
            onError?.error?.localizedFailureReason ||
            onError?.error?.localizedDescription ||
            ERROR_MESSAGE;
          updateError(message);
          logEvent({
            message,
            isError: true,
          });
        }}
        paused={!isAndroid}
        rate={0.0}
        resizeMode="contain"
        source={{
          uri: props.current.url,
        }}
        style={styles.fullScreen}
      />
    );
  };

  const isImageAttach = (): boolean => !!props.imageAttachments?.length;

  const renderError = (): React.ReactNode => (
    <View style={[styles.container, styles.error]}>
      <IconNoProjectFound />
      <Text style={styles.errorTitle}>{error || ERROR_MESSAGE}</Text>
      {renderOpenButton()}
    </View>
  );

  const renderImageGallery = (): null | React.ReactElement<
    React.ComponentProps<typeof Gallery>,
    typeof Gallery
  > => {
    return (
      <Gallery
        images={props.imageAttachments.map(createSource)}
        initialPage={getCurrentIndex(props.current)}
        imageComponent={renderImage}
        onPageSelected={updateCurrentIndex}
        pageMargin={1}
      />
    );
  };

  const renderOpenButton = (): React.ReactElement<
    React.ComponentProps<typeof TouchableOpacity>,
    typeof TouchableOpacity
  > => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Preview file externally');
    const attach: Attachment = isImageAttach()
      ? props.imageAttachments[index]
      : props.current;
    return (
      <TouchableOpacity onPress={() => Linking.openURL(attach.url)}>
        <Text style={styles.link} numberOfLines={2}>
          {attach.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedView
      animation="fadeIn"
      duration={200}
      useNativeDriver={true}
      style={styles.container}
    >
      <Header
        leftButton={
          <IconClose
            size={21}
            color={styles.link.color}
            style={styles.closeIcon}
          />
        }
        onBack={closeView}
        style={styles.header}
      >
        {!error && <View>{renderOpenButton()}</View>}
      </Header>

      {isImageAttach() && renderImageGallery()}

      {!isImageAttach() && renderVideo()}

      {isLoading && renderLoader()}

      {!!error && renderError()}
    </AnimatedView>
  );
};

export default React.memo<Props>(ImagePreview) as React$AbstractComponent<
  Props,
  unknown
>;
