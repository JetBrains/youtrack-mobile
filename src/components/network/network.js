/* @flow */

import {AppState} from 'react-native';

import {useSelector} from 'react-redux';
import type {NetInfoState} from '@react-native-community/netinfo';

export function useIsNetworkConnected() {
  const networkState: ?NetInfoState = useSelector((appState: AppState) => appState?.app?.networkState);
  return networkState?.isConnected;
}
