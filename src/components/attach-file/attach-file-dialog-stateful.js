/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';

import attachFile from './attach-file';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import usage from '../usage/usage';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {HIT_SLOP} from '../common-styles/button';
import {IconAttachment, IconCamera, IconCheck, IconClose} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {notify} from '../notification/notification';
import {ThemeContext} from '../theme/theme-context';

import styles from './attach-file-modal.styles';

import type {ActionSheetAction} from '../../flow/Action';
import type {Attachment, ImageDimensions} from '../../flow/CustomFields';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

export const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};

export const attachFileActions: Array<ActionSheetAction> = [
  {
    id: attachFileMethod.openPicker,
    title: 'Choose from library…',
    icon: IconAttachment,
    execute: () => {}
  },
  {
    id: attachFileMethod.openCamera,
    title: 'Take a picture…',
    icon: IconCamera,
    execute: () => {}
  }
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


const AttachFileDialogStateful = (props: Props) => {
  usage.trackScreenView('Attach file modal');

  const theme: Theme = useContext(ThemeContext);

  const [attach, updateAttach] = useState(null);
  const [isAttaching, updateAttaching] = useState(false);

  useEffect(() => {
    if (props.source) {
      const action: ?ActionSheetAction = createActions().find((it: ActionSheetAction) => it.id === props.source);
      if (action && action.execute) {
        action.execute();
      }
    }
  }, [props.source]);

  const showSystemDialog = async (method: typeof attachFileMethod) => {
    try {
      const attachedImage: ?Attachment = await attachFile(method);
      if (attachedImage) {
        updateAttach(attachedImage);
      }
    } catch (err) {
      notify('Can\'t add a file', err);
    }
  };

  const createActions = (): Array<ActionSheetAction> => {
    return attachFileActions.map((action: ActionSheetAction) => {
      if (action.id === attachFileMethod.openPicker) {
        action.execute = () => {
          logEvent({
            message: 'Attach file from storage',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
          });
          showSystemDialog(attachFileMethod.openPicker);
        };
      } else {
        action.execute = () => {
          logEvent({
            message: 'Attach file via camera',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
          });
          showSystemDialog(attachFileMethod.openCamera);
        };
      }
      return action;
    });
  };

  const linkColor: string = styles.link.color;
  const disabledColor: string = styles.disabled.color;
  const dimensions: ?ImageDimensions = attach && calculateAspectRatio(attach.dimensions);
  const hasAttach: boolean = !!attach;
  return (
    <ModalView
      animationType="slide"
      testID="attachFileModal"
      style={styles.container}
    >
      <Header
        leftButton={
          <IconClose size={21} color={isAttaching ? disabledColor : linkColor}/>
        }
        onBack={() => {
          !isAttaching && props.actions.onCancel();
        }}
        rightButton={(
          isAttaching ? <ActivityIndicator color={styles.link.color}/> :
            <IconCheck size={20} color={hasAttach ? styles.link.color : styles.disabled.color}/>
        )}
        onRightButtonClick={() => {
          if (attach) {
            updateAttaching(true);
            props.actions.onAttach(attach, () => {
              updateAttaching(false);
            });
          }
        }}>
        <Text style={styles.title}>Attach image</Text>
      </Header>

      <View style={styles.content}>
        <View style={styles.image}>
          {attach && <AttachmentErrorBoundary
            attachName={attach.name}
          >
            <Image
              source={{
                isStatic: true,
                uri: attach.url,
                width: dimensions?.width,
                height: dimensions?.height,
              }}
            />
          </AttachmentErrorBoundary>}
          {attach && !props.hideVisibility && props.getVisibilityOptions && (
            <VisibilityControl
              style={styles.visibilityButton}
              onApply={(visibility: Visibility | null) => {
                updateAttach({
                  ...attach,
                  visibility
                });
              }}
              uiTheme={theme.uiTheme}
              getOptions={props.getVisibilityOptions}
            />
          )}
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

export default AttachFileDialogStateful;
