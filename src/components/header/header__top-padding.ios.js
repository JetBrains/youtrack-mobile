/* @flow */
import {StatusBarIOS, NativeModules, Dimensions} from 'react-native';

const {StatusBarManager} = NativeModules;
const X_XS_SIZE = 812;
const XS_MAX_XR_SIZE = 896;
export const isIphoneX = [X_XS_SIZE, XS_MAX_XR_SIZE].includes(Dimensions.get('window').height);

const HEIGHT_WITH_BAR = isIphoneX ? 48 : 32;
const HEIGHT_WITHOUT_BAR = 12;

let height = HEIGHT_WITH_BAR;
let heightChangeCallback = () => {};

function updateHeight() {
  StatusBarManager.getHeight((statusBarFrameData) => {
    const statusBarHeight = statusBarFrameData.height;
    height = statusBarHeight === 0 ? HEIGHT_WITHOUT_BAR : HEIGHT_WITH_BAR;
    heightChangeCallback();
  });
}

StatusBarIOS.addListener('statusBarFrameWillChange', updateHeight);

export default function getTopPadding() {
  return height;
}

export function onHeightChange(callback: any => any) {
  heightChangeCallback = callback;
}
