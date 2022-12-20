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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import attachFile, {attachFileMethod} from './attach-file';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import Header from '../header/header';
import IconAttachment from '@jetbrains/icons/attachment.svg';
import ModalPortal from '../modal-view/modal-portal';
import ModalView from '../modal-view/modal-view';
import usage from '../usage/usage';
import Video from 'react-native-video';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {getApi} from '../api/api__instance';
import {hasMimeType} from '../mime-type/mime-type';
import {HIT_SLOP} from '../common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconCamera, IconCheck, IconClose} from '../icon/icon';
import {isSplitView} from '../responsive/responsive-helper';
import {logEvent} from '../log/log-helper';
import {notifyError} from '../notification/notification';
import {ThemeContext} from '../theme/theme-context';
import styles from './attach-file-dialog.styles';
import type {ActionSheetAction} from 'types/Action';
import type {ImageDimensions} from 'types/CustomFields';
import type {DisplayMetrics} from 'react-native/Libraries/Utilities/NativeDeviceInfo';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme} from 'types/Theme';
import type {UserGroup} from 'types/UserGroup';
import type {User} from 'types/User';
import type {Visibility} from 'types/Visibility';
type Props = {
  actions: {
    onAttach: (
      attachments: Array<NormalizedAttachment>,
      onAttachingFinish: () => any,
    ) => any;
    onCancel: () => any;
  };
  getVisibilityOptions: () => Array<User | UserGroup>;
  hideVisibility?: boolean;
  source?: keyof typeof attachFileMethod;
};

const AttachFileDialog = (
  props: Props,
): React.ReactElement<
  React.ComponentProps<typeof ModalView>,
  typeof ModalView
> => {
  const mounted: {
    current: boolean;
  } = useRef(false);
  usage.trackScreenView('Attach file modal');
  const theme: Theme = useContext(ThemeContext);
  const [
    attaches,
    updateAttaches,
  ] = useState<Array<NormalizedAttachment> | null>(null);
  const [isAttaching, updateAttaching] = useState(false);
  const createActions = useCallback((): Array<ActionSheetAction> => {
    return [
      {
        id: attachFileMethod.openPicker,
        title: i18n('Choose from library…'),
        icon: IconAttachment,
        iconSize: 22,
        execute: () => {},
      },
      {
        id: attachFileMethod.openCamera,
        title: i18n('Take a picture…'),
        icon: IconCamera,
        iconSize: 18,
        execute: () => {},
      },
    ].map((action: ActionSheetAction) => {
      if (action.id === attachFileMethod.openPicker) {
        action.execute = () => {
          logEvent({
            message: 'Attach file from storage',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
          showSystemDialog(attachFileMethod.openPicker);
        };
      } else {
        action.execute = () => {
          logEvent({
            message: 'Attach file via camera',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
          showSystemDialog(attachFileMethod.openCamera);
        };
      }

      return action;
    });
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
      const attachedFiles: Array<NormalizedAttachment> | null = await attachFile(
        method,
      );

      if (attachedFiles) {
        updateAttaches(attachedFiles);
      }
    } catch (err) {
      notifyError(err);
    }
  };

  const renderMedia: (file: NormalizedAttachment) => any = (
    file: NormalizedAttachment,
  ): React.ReactElement<React.ComponentProps<typeof Video>, typeof Video> => {
    const dimensions: DisplayMetrics = Dimensions.get('window');
    return (
      <Video
        style={{
          minHeight: Math.min(file.dimensions.height, dimensions.height / 1.5),
          minWidth: Math.min(file.dimensions.width, dimensions.width),
        }}
        controls={true}
        fullscreen={false}
        headers={getApi().auth.getAuthorizationHeaders()}
        paused={false}
        rate={0.0}
        resizeMode="contain"
        source={{
          uri: file?.url,
        }}
      />
    );
  };

  const renderImage: (
    file: NormalizedAttachment,
  ) => React.ReactElement<React.ComponentProps<any>, any> = (
    file: NormalizedAttachment,
  ): React.ReactElement<React.ComponentProps<typeof Image>, typeof Image> => {
    const dimensions: ImageDimensions | null | undefined =
      file && calculateAspectRatio(file.dimensions);
    return (
      <Image
        style={styles.imagePreview}
        resizeMode="contain"
        source={{
          isStatic: true,
          uri: file?.url,
          width: dimensions?.width,
          height: dimensions?.height,
        }}
      />
    );
  };

  const renderPreview = (
    files: Array<NormalizedAttachment>,
  ): Array<React.ReactElement<React.ComponentProps<any>, any>> => {
    return files.map((file: NormalizedAttachment, index: number) => {
      const isMediaMimeType: boolean =
        hasMimeType.audio(file) || hasMimeType.video(file);

      if (file?.url) {
        return (
          <AttachmentErrorBoundary
            key={`${file.name}-${index}`}
            attachName={file.name}
          >
            <>
              {isMediaMimeType && renderMedia(file)}
              {!isMediaMimeType && hasMimeType.image(file) && renderImage(file)}
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
              mounted.current === true && updateAttaching(false);
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

export default React.memo<Props>(AttachFileDialog) as React$AbstractComponent<
  Props,
  unknown
>;
