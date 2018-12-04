/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal, DeviceEventEmitter} from 'react-native';
import getTopPadding from '../header/header__top-padding';
import styles from '../debug-view/debug-view.styles';
import {closeScanView} from '../../actions/app-actions';
import {RNCamera} from 'react-native-camera';
import Router from '../router/router';
import {applyCommand} from '../../views/single-issue/single-issue-actions';
import {applyCommandForDraft} from '../../views/create-issue/create-issue-actions';
import {notify} from '../notification/notification';

const commandViews = {
  SingleIssue: applyCommand,
  CreateIssue: applyCommandForDraft
};

const getRoute = () => {
  const nav = Router._getNavigator().state.nav;
  const routeIndex = nav.index;
  return nav.routes[routeIndex];
};

type Props = {
  show: boolean,
  onHide: Function,
  draftId?: string,
  onCommandApply: Function
};

export class ScanView extends Component<Props, void> {
  camera = null;

  constructor(props: Props) {
    super(props);

    DeviceEventEmitter.addListener('openWithUrl', this.processLink);
  }

  processLink = async (code: string) => {
    if (code.indexOf('youtrack://') !== -1) {
      const clearCode = code.replace('youtrack://', '').trim();
      const parts = clearCode.split(';');

      if (parts.length >= 2) {
        const [type, arg] = parts;

        if (type === 'issue') {
          Router.SingleIssue({issueId: arg});
        } else if (type === 'command' || type === 'create') {
          if (type === 'create') {
            Router.CreateIssue();

            while (!this.props.draftId) { // wait for draft being loaded
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          const applyAction = commandViews[getRoute().routeName];

          if (applyAction) {
            this.props.onCommandApply(arg, applyAction);
          } else {
            notify(`Command can not be applied on this screen`);
          }
        }
      } else if (parts.length === 1) {
        Router.SingleIssue({issueId: parts[0]});
      } else {
        notify('Wrong QR code format');
      }
    }
  };

  onBarCode = (data: Object) => {
    this.processLink(data.data);

    this.props.onHide();
  };

  render() {
    const {show, onHide} = this.props;
    if (!show) {
      return null;
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={onHide}
      >
        <View style={[styles.container, {paddingTop: getTopPadding()}]}>

          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={{flex: 1}}
            onBarCodeRead={this.onBarCode}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
          />


          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onHide}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showScanner,
    draftId: state.creation.issue && state.creation.issue.id,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onHide: () => dispatch(closeScanView()),
    onCommandApply: (command, applyAction) => dispatch(applyAction(command))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);
