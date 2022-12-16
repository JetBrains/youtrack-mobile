/* @flow */

import {DeviceEventEmitter} from 'react-native';

import type {NetInfoState} from '@react-native-community/netinfo';

const customEvents = {
  deviceOnline: 'device/online',
};

const addListenerGoOnline = (callback: (any) => any) => DeviceEventEmitter.addListener(
  customEvents.deviceOnline,
  callback
);

const emitGoOnlineEvent = (state: NetInfoState) => DeviceEventEmitter.emit(
  customEvents.deviceOnline,
  state
);

export {
  addListenerGoOnline,
  emitGoOnlineEvent,
  customEvents,
};
