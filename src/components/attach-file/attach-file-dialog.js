/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import {getApi} from '../api/api__instance';
import {IconCheck, IconClose} from '../icon/icon';
import VisibilityControl from '../visibility/visibility-control';
import usage from '../usage/usage';

import {COLOR_GRAY, COLOR_ICON_LIGHT_BLUE, COLOR_PINK} from '../variables/variables';
import {HIT_SLOP} from '../common-styles/button';

import styles from './attach-file-modal.styles';

import type {Attachment, ImageDimensions} from '../../flow/CustomFields';
import type {Visibility} from '../../flow/Visibility';

type Action = { title: string, execute: () => any, icon?: any };

type Props = {
  issueId: string,
  actions: Array<Action>,
  attach: Attachment,
  onCancel: () => any,
  onAttach: (file: Attachment) => any
};

type State = {
  attach: Attachment
}

const CATEGORY_NAME = 'Attach file modal';


export default class AttachFileDialog extends PureComponent<Props, State> {
  headers: { Authorization: string } = getApi().auth.getAuthorizationHeaders();

  constructor(props: Props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);

    this.state = {
      attach: props.attach
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.attach !== this.props.attach) {
      this.setState({
        attach: this.props.attach
      });
    }
  }

  attachFile = () => {
    if (this.state.attach) {
      this.props.onAttach(this.state.attach);
    }
  };

  updateAttachVisibility = (visibility: Visibility | null) => {
    this.setState({
      attach: {
        ...this.state.attach,
        visibility
      }
    });
  };

  render() {
    const {actions, attach} = this.props;
    const dimensions: ?ImageDimensions = attach && calculateAspectRatio(attach.dimensions);
    const hasAttach: boolean = !!attach;

    return (
      <ModalView
        animationType="slide"
        testID="attachFileModal"
        style={styles.container}
      >
        <Header
          leftButton={<IconClose size={21} color={COLOR_PINK}/>}
          onBack={this.props.onCancel}
          rightButton={<IconCheck size={20} color={hasAttach ? COLOR_PINK : COLOR_GRAY}/>}
          onRightButtonClick={this.attachFile}>
          <Text style={styles.title}>Attach image</Text>
        </Header>

        <View style={styles.content}>

          <View style={styles.image}>
            {attach && (
              <AttachmentErrorBoundary
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
              </AttachmentErrorBoundary>
            )
            }
            {attach && <VisibilityControl
              style={styles.visibilityButton}
              issueId={this.props.issueId}
              onApply={this.updateAttachVisibility}
            />}
          </View>


          <View>
            {actions.map((action: Action) => {
              return (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  key={action.title}
                  onPress={action.execute}
                  style={styles.button}
                >
                  {action.icon && <action.icon size={20} color={COLOR_ICON_LIGHT_BLUE} style={styles.buttonIcon}/>}
                  <Text style={styles.buttonText}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}

          </View>
        </View>

      </ModalView>
    );
  }
}
