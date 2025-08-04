import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
// @ts-ignore
import {LogView} from 'react-native-device-log';

import ModalPortal from 'components/modal-view/modal-portal';
import {closeDebugView} from 'actions/app-actions';
import {copyRawLogs} from 'components/log/log';
import {i18n} from 'components/i18n/i18n';

import styles from './logs-view.styles';

interface Props {
  logsStyle: {
    textColor: string;
    backgroundColor: string;
    separatorColor: string;
  };
}

export const LogsView: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const showDebugView = useSelector((state: any) => state.app.showDebugView);

  if (!showDebugView) {
    return null;
  }

  const onHide = () => dispatch(closeDebugView());

  return (
    <ModalPortal onHide={onHide}>
      <View style={styles.container}>
        <LogView
          inverted={true}
          multiExpanded={true}
          timeStampFormat="HH:mm:ss"
          {...props.logsStyle}
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
};

export default React.memo(LogsView);
