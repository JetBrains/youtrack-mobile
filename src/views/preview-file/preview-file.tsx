import React from 'react';
import {View, ActivityIndicator, Text, TouchableOpacity, Linking} from 'react-native';

// @ts-ignore
import Gallery from 'react-native-image-gallery';
import Video from 'react-native-video';
import {SvgFromUri, SvgUri} from 'react-native-svg';
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

import type {Attachment as Attach} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {RequestHeaders} from 'types/Auth';

interface FileSource {
  id: string;
  uri: string;
  headers?: RequestHeaders;
  mimeType: string;
}

type File = Attach | NormalizedAttachment;

interface Props {
  file: File;
  files: File[];
  imageHeaders?: RequestHeaders;
  onRemove?: (index: number) => void;
  onHide?: () => void;
  onOpenAttachment?: (type: string, name: string) => void;
}

interface VideoError {
  error: {
    '': string;
    errorString: string;
    code: number;
    domain: string;
    localizedDescription: string;
    localizedFailureReason: string;
    localizedRecoverySuggestion: string;
  };
}

const isAndroid: boolean = isAndroidPlatform();
const ERROR_MESSAGE: string = 'Cannot load a preview';

const FilesPreview = (props: Props) => {
  const [index, setCurrentIndex] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const closeView = () => {
    if (props.onHide) {
      props.onHide();
    } else {
      Router.pop(true);
    }
  };

  const isImage = (f: File): boolean => hasMimeType.image(f);

  const isMedia = (f: File) => hasMimeType.video(f) || hasMimeType.audio(f);

  const isSVG = (f: File) => hasMimeType.svg(f);

  const getImageFiles = React.useCallback((): File[] => props.files.filter(isImage), [props.files]);

  React.useEffect(() => {
    setError(null);
    setIsLoading(false);
    if (props.files) {
      setCurrentIndex(getImageFiles().findIndex(f => f.url === props.file.url));
    }
  }, [getImageFiles, props.file, props.files]);

  const renderLoader = () => <ActivityIndicator color={styles.loader.color} style={styles.loader} />;

  const renderImage = (img: {source: File}) => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Open image');
    if (!img) {
      return null;
    }
    const imageFile = getImageFiles()[index];
    const dimensions = imageFile && 'imageDimensions' in imageFile ? imageFile.imageDimensions : {};
    return hasMimeType.svg(img.source) ? (
      <SvgFromUri width="100%" height="100%" uri={img.source.url} />
    ) : (
      <ImageWithProgress renderError={renderError} {...img} imageStyle={[styles.preview, dimensions]} />
    );
  };

  const createSource = (f: File): {source: FileSource} => {
    return {
      source: {
        id: 'id' in f ? f.id : f.url,
        uri: f.url,
        headers: props.imageHeaders,
        mimeType: f.mimeType || '',
      },
    };
  };

  const renderVideo = () => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Open video');
    return (
      <View style={styles.videoContainer}>
        <Video
          controls={true}
          fullscreen={false}
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
          onReadyForDisplay={() => setIsLoading(false)}
          onError={(e: VideoError) => {
            setIsLoading(false);
            const message: string = e?.error?.localizedFailureReason || e?.error?.localizedDescription || ERROR_MESSAGE;
            setError(message);
            logEvent({
              message,
              isError: true,
            });
          }}
          paused={!isAndroid}
          rate={0.0}
          resizeMode="contain"
          source={{
            uri: props.file.url,
            headers: props.imageHeaders,
          }}
          style={styles.video}
        />
      </View>
    );
  };

  const renderError = () => (
    <View style={[styles.container, styles.error]}>
      <IconNoProjectFound />
      <Text style={styles.errorTitle}>{error || ERROR_MESSAGE}</Text>
      {renderOpenButton()}
    </View>
  );

  const openAttachmentUrl = () => {
    props?.onOpenAttachment?.('file', props.file.name);
    Router.AttachmentPreview({url: props.file.url, name: props.file.name, headers: props.imageHeaders});
  };

  const renderSVG = () => {
    return isAndroid ? openAttachmentUrl() : (
      <View testID="attachmentSvg" style={styles.attachmentThumbContainer}>
        <SvgUri
          width="100%"
          height="100%"
          uri={props.file.url}
        />
      </View>
    );
  };

  const renderImageGallery = () => {
    const imageFiles = getImageFiles();
    return (
      <Gallery
        images={imageFiles.map(createSource)}
        initialPage={imageFiles.findIndex(f => f.url === props.file.url)}
        imageComponent={renderImage}
        onPageSelected={setCurrentIndex}
        pageMargin={1}
      />
    );
  };

  const renderOpenButton = () => {
    usage.trackEvent(ANALYTICS_PREVIEW_PAGE, 'Preview file externally');
    const f: File = isImage(props.file) ? getImageFiles()[index] : props.file;
    return (
      <TouchableOpacity onPress={() => Linking.openURL(f.url)}>
        <Text style={styles.link} numberOfLines={2}>
          {f.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const svg = isSVG(props.file);
  const image = isImage(props.file);
  const media = isMedia(props.file);

  return (
    <AnimatedView animation="fadeIn" duration={200} useNativeDriver={true} style={styles.container}>
      <Header
        leftButton={<IconClose color={styles.link.color} style={styles.closeIcon} />}
        onBack={closeView}
        style={styles.header}
      >
        {!error && <View>{renderOpenButton()}</View>}
      </Header>

      <View style={styles.container}>
        {!error && (
          <>
            {svg && renderSVG()}
            {image && renderImageGallery()}
            {media && renderVideo()}
            {!svg && !image && !media && openAttachmentUrl()}
          </>
        )}
        {isLoading && renderLoader()}
        {!!error && renderError()}
      </View>
    </AnimatedView>
  );
};

export default React.memo(FilesPreview);
