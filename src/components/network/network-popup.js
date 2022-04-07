/* @flow */

import React, {useCallback, useEffect, useRef} from 'react';
import {AppState} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useDispatch} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Toast, {DURATION} from 'react-native-easy-toast';
import {isIOSPlatform} from '../../util/util';
import {setNetworkState} from '../../actions/app-actions';

import styles from './network-pupup.styles';

import type {AppStateValues} from 'react-native/Libraries/AppState/AppState';
import type {EdgeInsets} from 'react-native-safe-area-context/src/SafeArea.types';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {Node} from 'react';
import {useIsNetworkConnected} from './network';

export default function NetworkPopup(): Node {
  const toastInstance = useRef(null);
  const dispatch: Function = useDispatch();
  const isConnected: ?boolean = useIsNetworkConnected();
  const insets: EdgeInsets = useSafeAreaInsets();

  const updateNetworkState = useCallback((state: NetInfoState) => {
    if (state.isConnected !== isConnected) {
      // eslint-disable-next-line no-unused-vars
      const {details, ...rest} = state;
      dispatch(setNetworkState(rest));
      if (toastInstance.current) {
        if (rest?.isConnected === false) {
          toastInstance.current.show('Offline', DURATION.FOREVER);
        } else if (rest?.isConnected === true) {
          toastInstance.current?.close();
        }
      }
    }
  }, [dispatch, isConnected]);

  useEffect(() => {
    const unsubscribeNetInfoListener = NetInfo.addEventListener(updateNetworkState);
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateValues) => {
      if (isIOSPlatform() && nextAppState === 'active') {
        NetInfo.fetch().then(updateNetworkState);
      }
    });
    return () => {
      unsubscribeNetInfoListener();
      if (appStateListener) {
        appStateListener.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Toast
    ref={toastInstance}
    style={styles.container}
    position="top"
    positionValue={typeof insets?.top === 'number' ? insets?.top : 40}
    opacity={1}
    textStyle={styles.text}
  />;
}
