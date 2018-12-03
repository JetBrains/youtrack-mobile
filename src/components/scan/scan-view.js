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
import {notify} from '../notification/notification';

type Props = {
  show: boolean,
  onHide: Function,
  onCommandApply: Function
};

export class ScanView extends Component<Props, void> {
  camera = null;

  constructor(props: Props) {
    super(props);

    DeviceEventEmitter.addListener('openWithUrl', this.processLink);
  }

  processLink = (code: string) => {
    if (code.indexOf('youtrack://') !== -1) {
      const clearCode = code.replace('youtrack://', '').trim();
      const parts = clearCode.split(';');

      if (parts.length >= 2) {
        const [type, arg] = parts;

        if (type === 'issue') {
          Router.SingleIssue({issueId: arg});
        } else if (type === 'command') {

          const nav = Router._getNavigator().state.nav;

          const routeIndex = nav.index;
          const currentRoute = nav.routes[routeIndex];

          if (currentRoute.routeName === 'SingleIssue') {
            this.props.onCommandApply(arg);
          } else {
            notify('Command can be applied only on issue screen');
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
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onHide: () => dispatch(closeScanView()),
    onCommandApply: command => dispatch(applyCommand(command))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);
