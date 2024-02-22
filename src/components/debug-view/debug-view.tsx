import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {connect} from 'react-redux';
import {LogView} from 'react-native-device-log';

import ModalPortal from 'components/modal-view/modal-portal';
import {closeDebugView} from 'actions/app-actions';
import {copyRawLogs} from 'components/log/log';
import {i18n} from 'components/i18n/i18n';

import styles from './debug-view.styles';
type Props = {
  show: boolean;
  onHide: (...args: any[]) => any;
  backgroundColor: string;
  logsStyle: {
    textColor: string;
    backgroundColor: string;
    separatorColor: string;
  };
};
export class DebugView extends PureComponent<Props, void> {
  render(): React.ReactNode {
    const {show, onHide, logsStyle} = this.props;

    if (!show) {
      return null;
    }

    return (
      <ModalPortal onHide={onHide}>
        <View style={styles.container}>
          <LogView
            inverted={true}
            multiExpanded={true}
            timeStampFormat="HH:mm:ss"
            {...logsStyle}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onHide}>
              <Text style={styles.closeButtonText}>{i18n('Close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={copyRawLogs}>
              <Text style={styles.closeButtonText}>{i18n('Share')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalPortal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showDebugView,
    ...ownProps,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onHide: () => dispatch(closeDebugView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DebugView);
