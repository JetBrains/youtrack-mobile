/* @flow */
import React, {Component} from 'react';
import Feature from '../feature/feature';
import {Image, TouchableOpacity} from 'react-native';
import styles from '../debug-view/debug-view.styles';
import {qrCode} from '../icon/icon';
import {openScanView} from '../../actions/app-actions';
import {connect} from 'react-redux';

type Props = {
  show: Function
};

export class OpenScanButton extends Component<Props, void> {
  render() {
    return (
      <Feature name={'industrial'}>
        <TouchableOpacity
          testID="qr-code-scan-action"
          style={[styles.headerButton, styles.headerButtonRight]}
          onPress={this.props.show}>
          <Image style={{height: 20, width: 20}} source={qrCode}/>
        </TouchableOpacity>
      </Feature>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    show: () => dispatch(openScanView())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenScanButton);
