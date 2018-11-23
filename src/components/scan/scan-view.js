/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal} from 'react-native';
import getTopPadding from '../header/header__top-padding';
import styles from '../debug-view/debug-view.styles';
import {closeScanView} from '../../actions/app-actions';
import {RNCamera} from 'react-native-camera';

type Props = {
  show: boolean,
  onHide: Function,
};

export class ScanView extends Component<Props, void> {
  camera = null;

  onBarCode = (data: Object) => {
    const code = data.data;

    if (code.indexOf('youtrack://') !== -1) {
      console.log('>>>>>>', code); // eslint-disable-line
    }
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
          ></RNCamera>


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
    onHide: () => dispatch(closeScanView())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);
