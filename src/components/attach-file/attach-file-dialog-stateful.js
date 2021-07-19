/* @flow */

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';

import attachFile from './attach-file';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import usage from '../usage/usage';
import Video from 'react-native-video';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {getApi} from '../api/api__instance';
import {hasMimeType} from '../mime-type/mime-type';
import {HIT_SLOP} from '../common-styles/button';
import {IconAttachment, IconCamera, IconCheck, IconClose} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {notify} from '../notification/notification';
import {ThemeContext} from '../theme/theme-context';

import styles from './attach-file-modal.styles';

import type {ActionSheetAction} from '../../flow/Action';
import type {Attachment, ImageDimensions} from '../../flow/CustomFields';
import type {NormalizedAttachment} from '../../flow/Attachment';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

export const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker',
};

export const attachFileActions: Array<ActionSheetAction> = [
  {
    id: attachFileMethod.openPicker,
    title: 'Choose from library…',
    icon: IconAttachment,
    iconSize: 22,
    execute: () => {},
  },
  {
    id: attachFileMethod.openCamera,
    title: 'Take a picture…',
    icon: IconCamera,
    iconSize: 18,
    execute: () => {},
  },
];


type Props = {
  actions: {
    onAttach: (attachment: Attachment, onAttachingFinish: () => any) => any,
    onCancel: () => any,
  },
  getVisibilityOptions: () => Array<User | UserGroup>,
  hideVisibility?: boolean,
  source?: typeof attachFileMethod,
};


const AttachFileDialogStateful = (props: Props): React$Element<typeof ModalView> => {
  usage.trackScreenView('Attach file modal');

  const theme: Theme = useContext(ThemeContext);

  const [attach, updateAttach] = useState(null);
  const [isAttaching, updateAttaching] = useState(false);

  const createActions = useCallback((): Array<ActionSheetAction> => {
    return attachFileActions.map((action: ActionSheetAction) => {
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
    if (props.source) {
      const action: ?ActionSheetAction = createActions().find((it: ActionSheetAction) => it.id === props.source);
      if (action && action.execute) {
        action.execute();
      }
    }
  }, [createActions, props.source]);

  const showSystemDialog = async (method: typeof attachFileMethod) => {
    try {
      const attachedFile: ?NormalizedAttachment = await attachFile(method);
      if (attachedFile) {
        updateAttach((attachedFile: any));
      }
    } catch (err) {
      notify('Can\'t add a file', err);
    }
  };

  const renderMedia: (attach: NormalizedAttachment) => any = (): React$Element<typeof Video> => {
    return (
      <Video
        style={styles.filePreview}
        controls={true}
        fullscreen={false}
        headers={getApi().auth.getAuthorizationHeaders()}
        paused={false}
        rate={0.0}
        resizeMode="contain"
        source={{uri: attach?.url}}
      />
    );
  };

  const renderImage: (
    attach: NormalizedAttachment
  ) => React$Element<any> = (): React$Element<typeof Image> => {
    const dimensions: ?ImageDimensions = attach && calculateAspectRatio(attach.dimensions);
    return (
      <Image
        resizeMode="contain"
        source={{
          isStatic: true,
          uri: attach?.url,
          width: dimensions?.width,
          height: dimensions?.height,
        }}
      />
    );
  };

  const renderPreview: (attach: NormalizedAttachment) => React$Element<any> = (): React$Element<any> => {
    const isMediaMimeType: boolean = hasMimeType.audio(attach) || hasMimeType.video(attach);
    if (attach?.url) {
      if (isMediaMimeType) {
        return renderMedia(attach);
      } else if (hasMimeType.image(attach)) {
        return renderImage(attach);
      }
    }
    return <View style={styles.filePreview}/>;
  };

  return (
    <ModalView
      animationType="slide"
      style={styles.container}
    >
      <Header
        leftButton={
          <IconClose size={21} color={isAttaching ? styles.disabled.color : styles.link.color}/>
        }
        onBack={() => {
          !isAttaching && props.actions.onCancel();
        }}
        rightButton={(
          isAttaching ? <ActivityIndicator color={styles.link.color}/> :
            <IconCheck size={20} color={attach ? styles.link.color : styles.disabled.color}/>
        )}
        onRightButtonClick={() => {
          if (attach) {
            updateAttaching(true);
            props.actions.onAttach(attach, () => {
              updateAttaching(false);
            });
          }
        }}>
        <Text style={styles.title}>{attach?.name || 'Attach file'}</Text>
      </Header>

      <View style={styles.content}>
        {attach && !props.hideVisibility && props.getVisibilityOptions && (
          <VisibilityControl
            style={styles.visibilityButton}
            onApply={(visibility: Visibility | null) => {
              updateAttach({
                ...attach,
                visibility,
              });
            }}
            uiTheme={theme.uiTheme}
            getOptions={props.getVisibilityOptions}
          />
        )}
        <View style={styles.image}>
          {attach && <AttachmentErrorBoundary
            attachName={attach.name}
          >
            <>{renderPreview(attach)}</>
          </AttachmentErrorBoundary>}
        </View>

        {!attach && <View>
          {createActions().map((action: ActionSheetAction) => {
            return (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                key={action.title}
                onPress={action.execute}
                style={styles.button}
              >
                {action.icon && <action.icon size={20} color={styles.buttonIcon.color} style={styles.buttonIcon}/>}
                <Text style={styles.buttonText}>{action.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>}
      </View>

    </ModalView>
  );
};

export default (React.memo<Props>(AttachFileDialogStateful): React$AbstractComponent<Props, mixed>);
