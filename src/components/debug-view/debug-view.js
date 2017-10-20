/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal} from 'react-native';
import {LogView} from 'react-native-device-log';
import getTopPadding from '../../components/header/header__top-padding';
import styles from './debug-view.styles';
import {closeDebugView} from '../../actions/app-actions';

type Props = {
  show: boolean,
  onHide: Function
};

export class DebugView extends Component<Props, void> {
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
          <LogView
            inverted={true}
            multiExpanded={true}
            timeStampFormat="HH:mm:ss"
          />

          <View>
            <TouchableOpacity style={styles.closeButton} onPress={(onHide)}>
              <Text style={styles.closeButtonText}>Close log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showDebugView,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onHide: () => dispatch(closeDebugView())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DebugView);
