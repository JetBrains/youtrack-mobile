/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal, Share} from 'react-native';
import deviceLog, {LogView} from 'react-native-device-log';
import getTopPadding from '../../components/header/header__top-padding';
import styles from './debug-view.styles';
import {closeDebugView} from '../../actions/app-actions';

export async function getLogs() {
  const rows = await deviceLog.store.getRows();

  return rows
    .reverse() // They store comments in reverse order
    .map(row => `${row.timeStamp._i}: ${row.message}`)
    .join('\n');
}

export async function copyRawLogs() {
  const logs = await getLogs();
  Share.share({itle: 'YouTrack Mobile render crash logs', message: logs}, {dialogTitle: 'Share issue URL'});
}

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

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onHide}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={copyRawLogs}>
              <Text style={styles.closeButtonText}>Share</Text>
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
