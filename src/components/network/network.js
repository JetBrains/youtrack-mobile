/* @flow */

import React, {useEffect} from 'react';

import NetInfo from '@react-native-community/netinfo';
import Toast, {DURATION} from 'react-native-easy-toast';
import {setNetworkState} from '../../actions/app-actions';
import {useDispatch, useSelector} from 'react-redux';

import styles from './network.styles';

import type {AppState} from '../../reducers';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {Node} from 'React';


export default function NetworkPopup(): Node {
  const dispatch: Function = useDispatch();
  const networkState: ?NetInfoState = useSelector((appState: AppState) => appState?.app?.networkState);
  let toastInstance;

  const updateNetInfoState = (state: NetInfoState) => {
    if (state.isConnected !== networkState?.isConnected) {
      // eslint-disable-next-line no-unused-vars
      const {details, ...rest} = state;
      dispatch(setNetworkState(rest));
      if (toastInstance) {
        if (rest.isConnected === false) {
          toastInstance.show('Offline', DURATION.FOREVER);
        } else {
          toastInstance.close();
        }
      }
    }
  };

  useEffect(() => {
    NetInfo.fetch().then(updateNetInfoState);
    return NetInfo.addEventListener(updateNetInfoState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Toast
    ref={(instance) => instance && (toastInstance = instance)}
    style={styles.container}
    position="top"
    positionValue={40}
    opacity={1}
    textStyle={styles.text}
  />;
}
