/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import {getApi} from '../api/api__instance';
import {IconCheck, IconClose} from '../icon/icon';
import VisibilityControl from '../visibility/visibility-control';
import usage from '../usage/usage';

import {HIT_SLOP} from '../common-styles/button';

import styles from './attach-file-modal.styles';

import type {Attachment, ImageDimensions} from '../../flow/CustomFields';
import type {Visibility} from '../../flow/Visibility';
import type {UITheme} from '../../flow/Theme';

type Action = { title: string, execute: () => any, icon?: any };

type Props = {
  issueId: string,
  actions: Array<Action>,
  attach: Attachment,
  onCancel: () => any,
  onAttach: (file: Attachment, onAttachingFinish: () => any) => any,
  uiTheme: UITheme
};

type State = {
  attach: Attachment,
  isAttaching: boolean
}

const CATEGORY_NAME = 'Attach file modal';


export default class AttachFileDialog extends PureComponent<Props, State> {
  _isMounted: boolean = false;
  headers: { Authorization: string } = getApi().auth.getAuthorizationHeaders();

  constructor(props: Props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);

    this.state = {
      attach: props.attach,
      isAttaching: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.attach !== this.props.attach) {
      this.setState({
        attach: this.props.attach
      });
    }
  }

  toggleAttachingProgress = (isAttaching: boolean) => {
    if (this._isMounted) {
      this.setState({isAttaching});
    }
  };

  attachFile = () => {
    if (this.state.attach) {
      this.toggleAttachingProgress(true);
      this.props.onAttach(this.state.attach, () => this.toggleAttachingProgress(false));
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

  onCancel = () => {
    !this.state.isAttaching && this.props.onCancel();
  }

  render() {
    const {actions, attach, uiTheme} = this.props;
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
            <IconClose size={21} color={this.state.isAttaching ? uiTheme.colors.$disabled : uiTheme.colors.$link}/>
          }
          onBack={this.onCancel}
          rightButton={(
            this.state.isAttaching ? <ActivityIndicator color={uiTheme.colors.$link}/> :
              <IconCheck size={20} color={hasAttach ? uiTheme.colors.$link : uiTheme.colors.$disabled}/>
          )}
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
              onApply={this.updateAttachVisibility}
              uiTheme={uiTheme}
              getOptions={() => getApi().issue.getVisibilityOptions(this.props.issueId)}
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
                  {action.icon && <action.icon size={20} color={uiTheme.colors.$iconAccent} style={styles.buttonIcon}/>}
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
