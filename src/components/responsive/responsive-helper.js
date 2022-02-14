/* @flow */

import {Dimensions} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import {getStorageState} from '../storage/storage';
import log from '../log/log';

const tabletSplitViewFactor: number = 0.66;

const isSplitView = (): boolean => {
  const windowWidth: number = Dimensions.get('window').width;
  const screenWidth: number = Dimensions.get('screen').width;
  let isHandsetModeForced: boolean = false;
  try {
    isHandsetModeForced = !!getStorageState().forceHandsetMode;
    log.log('Headset mode', isHandsetModeForced);
  } catch (e) {}
  return DeviceInfo.isTablet() && (windowWidth >= screenWidth * tabletSplitViewFactor) && !isHandsetModeForced;
};

export {
  isSplitView,
};
