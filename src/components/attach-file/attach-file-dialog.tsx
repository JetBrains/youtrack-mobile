import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScaledSize,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import IconFile from '@jetbrains/icons/file.svg';
import Video from 'react-native-video';

import attachFile, {attachFileMethod} from './attach-file';
import AttachmentErrorBoundary from 'components/attachments-row/attachment-error-boundary';
import calculateAspectRatio from 'components/aspect-ratio/aspect-ratio';
import FileThumb from 'components/attachments-row/attachment-thumbnail';
import Header from 'components/header/header';
import IconMedia from 'components/icon/assets/media.svg';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import usage from 'components/usage/usage';
import VisibilityControl from 'components/visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {hasMimeType} from 'components/mime-type/mime-type';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconCamera, IconCheck, IconClose} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {logEvent} from 'components/log/log-helper';
import {notifyError} from 'components/notification/notification';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './attach-file-dialog.styles';

import type {ActionSheetAction} from 'types/Action';
import type {CustomError} from 'types/Error';
import type {ImageDimensions} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme} from 'types/Theme';
import type {Visibility, VisibilityGroups} from 'types/Visibility';

type Props = {
  actions: {
    onAttach: (
      attachments: NormalizedAttachment[],
      onAttachingFinish: () => any,
    ) => any;
    onCancel: () => any;
  };
  getVisibilityOptions: () => Promise<VisibilityGroups>;
  hideVisibility?: boolean;
  source?: keyof typeof attachFileMethod;
};

const AttachFileDialog = (props: Props): JSX.Element => {
  usage.trackScreenView('Attach file modal');
  const mounted: React.MutableRefObject<boolean> = useRef(false);
  const theme: Theme = useContext(ThemeContext);
  const [attaches, updateAttaches] = useState<Array<NormalizedAttachment> | null>(null);
  const [isAttaching, updateAttaching] = useState<boolean>(false);

  const createActions = useCallback((): ActionSheetAction[] => {
  const doExecute = (method: keyof typeof attachFileMethod) => showSystemDialog(method);
    return [
      {
        id: attachFileMethod.document,
        title: i18n('Document'),
        icon: IconFile,
        iconSize: 22,
        execute: () => {
          logEvent({
            message: 'Attach document from storage',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
          doExecute(attachFileMethod.document);
        },
      },
      {
        id: attachFileMethod.openPicker,
        title: i18n('Photo and video library'),
        icon: IconMedia,
        iconSize: 22,
        execute: () => {
          logEvent({
            message: 'Attach file from storage',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
          doExecute(attachFileMethod.openPicker);
        },
      },
      {
        id: attachFileMethod.openCamera,
        title: i18n('Camera'),
        icon: IconCamera,
        iconSize: 18,
        execute: () => {
          logEvent({
            message: 'Attach file via camera',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
          doExecute(attachFileMethod.openCamera);
        },
      },
    ];
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (props.source) {
      const action: ActionSheetAction | null | undefined = createActions().find(
        (it: ActionSheetAction) => it.id === props.source,
      );

      if (action && action.execute) {
        action.execute();
      }
    }
  }, [createActions, props.source]);

  const showSystemDialog = async (method: keyof typeof attachFileMethod) => {
    try {
      const attachedFiles: NormalizedAttachment[] | null = await attachFile(method);
      if (attachedFiles) {
        updateAttaches(attachedFiles);
      }
    } catch (err) {
      notifyError(err as CustomError);
    }
  };

  const renderMedia = (file: NormalizedAttachment): React.ReactNode => {
    const dimensions: ScaledSize = Dimensions.get('window');
    return (
      <Video
        style={{
          minHeight: Math.min(file?.dimensions?.height || 300, dimensions.height / 1.5),
          minWidth: Math.min(file?.dimensions?.width || 300, dimensions.width),
        }}
        controls={true}
        fullscreen={false}
        paused={false}
        rate={0.0}
        resizeMode="contain"
        source={{
          uri: file?.url,
        }}
      />
    );
  };

  const renderImage = (file: NormalizedAttachment): React.ReactNode => {
    const dimensions: ImageDimensions | null | undefined = file && calculateAspectRatio(file.dimensions);
    return (
      <Image
        style={styles.imagePreview}
        resizeMode="contain"
        source={{
          uri: file?.url,
          width: dimensions?.width,
          height: dimensions?.height,
        }}
      />
    );
  };

  const renderPreview = (files: NormalizedAttachment[]): React.ReactNode => {
    return files.map((file: NormalizedAttachment, index: number) => {
      const isMediaMimeType: boolean = hasMimeType.audio(file) || hasMimeType.video(file);

      if (file?.url) {
        return (
          <AttachmentErrorBoundary
            key={`${file.name}-${index}`}
            attachName={file.name || 'file'}
          >
            <>
              {isMediaMimeType && renderMedia(file)}
              {!isMediaMimeType && (
                hasMimeType.image(file)
                  ? renderImage(file)
                  : <FileThumb style={styles.thumbnail} attach={file}/>
              )}
            </>
          </AttachmentErrorBoundary>
        );
      }

      return <View key={`file-${index}`} style={styles.filePreview} />;
    });
  };

  const render: (onHide: () => any) => any = (onHide: () => any) => (
    <>
      <Header
        leftButton={<IconClose size={21} color={styles.link.color} />}
        onBack={onHide}
        rightButton={
          isAttaching ? (
            <ActivityIndicator color={styles.link.color} />
          ) : (
            <IconCheck
              size={20}
              color={attaches ? styles.link.color : styles.disabled.color}
            />
          )
        }
        onRightButtonClick={() => {
          if (attaches) {
            updateAttaching(true);
            props.actions.onAttach(attaches, () => {
              if (mounted.current) {
                updateAttaching(false);
              }
            });
          }
        }}
      >
        <Text style={styles.title}>
          {attaches?.length === 1 ? attaches[0].name : i18n('Attach files')}
        </Text>
      </Header>

      <View style={styles.content}>
        {attaches && !props.hideVisibility && props.getVisibilityOptions && (
          <VisibilityControl
            style={styles.visibilityButton}
            onApply={(visibility: Visibility | null) => {
              updateAttaches(
                attaches.map((attach: NormalizedAttachment) => ({
                  ...attach,
                  visibility,
                })),
              );
            }}
            uiTheme={theme.uiTheme}
            getOptions={props.getVisibilityOptions}
          />
        )}
        <View style={styles.images}>
          {attaches && <ScrollView>{renderPreview(attaches)}</ScrollView>}
        </View>

        {!attaches && (
          <View>
            {createActions().map((action: ActionSheetAction) => {
              const size: number = action.iconSize || 20;
              return (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  key={action.title}
                  onPress={action.execute}
                  style={styles.button}
                >
                  {action.icon && (
                    <action.icon
                      size={size}
                      width={size}
                      height={size}
                      color={styles.buttonIcon.color}
                      fill={styles.buttonIcon.color}
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={styles.buttonText}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );

  const children = render(props.actions.onCancel);

  if (isSplitView()) {
    return (
      <ModalPortal onHide={props.actions.onCancel}>{children}</ModalPortal>
    );
  } else {
    return (
      <ModalView animationType="slide" style={styles.container}>
        {children}
      </ModalView>
    );
  }
};

export default React.memo<Props>(AttachFileDialog);
