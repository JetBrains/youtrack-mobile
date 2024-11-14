import {Dimensions, StatusBar} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import {getStorageState} from '../storage/storage';
import {isIOSPlatform} from 'util/util';


const tabletSplitViewFactor: number = 0.66;

const isDesktop = (): boolean => DeviceInfo.getDeviceType() === 'Desktop';

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
    isDesktop() ||
    DeviceInfo.isTablet() && windowWidth >= screenWidth * tabletSplitViewFactor
  );
};

const getKeyboardMargin = () => {
  let notchHeight: number;
  const isIOS = isIOSPlatform();
  if (isIOS) {
    if (DeviceInfo.isTablet()) {
      notchHeight = 8;
    } else {
      notchHeight = DeviceInfo.hasNotch() ? 44 : 0;
    }
  } else {
    notchHeight = StatusBar.currentHeight || 0;
  }
  return notchHeight;
};

export {
  getKeyboardMargin,
  isDesktop,
  isSplitView,
};
