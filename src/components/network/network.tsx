import React, {useCallback, useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast, {DURATION} from 'react-native-easy-toast';
import {useDispatch} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {emitGoOnlineEvent} from './network-events';
import {isIOSPlatform} from 'util/util';
import {setNetworkState} from '../../actions/app-actions';
import styles from './network.styles';
import type {AppStateValues} from 'react-native/Libraries/AppState/AppState';
import type {EdgeInsets} from 'react-native-safe-area-context/src/SafeArea.types';
import type {NetInfoState} from '@react-native-community/netinfo';
export default function Network(): React.ReactNode {
  const toastInstance = useRef(null);
  const dispatch: (...args: Array<any>) => any = useDispatch();
  const prevConnected = useRef(null);
  const insets: EdgeInsets = useSafeAreaInsets();
  const updateNetworkState = useCallback(
    async (state: NetInfoState) => {
      if (state.isConnected !== prevConnected?.current?.isConnected) {
        // eslint-disable-next-line no-unused-vars
        const {details, ...rest} = state;
        await dispatch(setNetworkState(rest));
        const wasOffline = !prevConnected?.current?.isConnected;

        if (state.isConnected === true && wasOffline) {
          emitGoOnlineEvent(state);
        }

        prevConnected.current = rest;

        if (toastInstance.current) {
          if (rest?.isConnected === false) {
            toastInstance.current.show('Offline', DURATION.FOREVER);
          } else if (rest?.isConnected === true) {
            toastInstance.current?.close();
          }
        }
      }
    },
    [dispatch],
  );
  useEffect(() => {
    const unsubscribeNetInfoListener = NetInfo.addEventListener(
      updateNetworkState,
    );
    const appStateListener = AppState.addEventListener(
      'change',
      (nextAppState: AppStateValues) => {
        if (isIOSPlatform() && nextAppState === 'active') {
          NetInfo.fetch().then(updateNetworkState);
        }
      },
    );
    return () => {
      unsubscribeNetInfoListener();

      if (appStateListener) {
        appStateListener.remove();
      }
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Toast
      ref={toastInstance}
      style={styles.container}
      position="top"
      positionValue={insets?.top}
      opacity={1}
      textStyle={styles.text}
    />
  );
}
