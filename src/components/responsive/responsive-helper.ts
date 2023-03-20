import {Dimensions} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import {getStorageState} from '../storage/storage';


const tabletSplitViewFactor: number = 0.66;

const isSplitView = (): boolean => {
  let isHandsetModeForced: boolean = false;

  try {
    isHandsetModeForced = !!getStorageState().forceHandsetMode;
  } catch (e) {}

  if (isHandsetModeForced === true) {
    return false;
  }

  const windowWidth: number = Dimensions.get('window').width;
  const screenWidth: number = Dimensions.get('screen').width;
  return (
    DeviceInfo.getDeviceType() === 'Desktop' ||
    DeviceInfo.isTablet() && windowWidth >= screenWidth * tabletSplitViewFactor
  );
};

export {isSplitView};
