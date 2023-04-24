import {Platform} from 'react-native';

import DeviceInfo from 'react-native-device-info';


const isDesktop = DeviceInfo.getDeviceType() === 'Desktop';
const delta = isDesktop ? 4 : 0;


export const HEADER_FONT_SIZE = 20 + delta;
export const MAIN_FONT_SIZE = 16 + delta;
export const SECONDARY_FONT_SIZE = 14 + delta;
export const monospaceFontAndroid = 'monospace';
export const monospaceFontIOS = 'Menlo';

export const monospace = {
  ...Platform.select({
    ios: {
      fontFamily: monospaceFontIOS,
    },
    android: {
      fontFamily: monospaceFontAndroid,
    },
  }),
};
export const headerTitle = {
  fontSize: HEADER_FONT_SIZE,
  letterSpacing: 0.13,
  fontWeight: '700',
};
export const secondaryText = {
  fontSize: SECONDARY_FONT_SIZE,
  letterSpacing: -0.17,
};
export const mainText = {
  fontSize: MAIN_FONT_SIZE,
  lineHeight: HEADER_FONT_SIZE,
  letterSpacing: -0.19,
};
export const markdownText = {
  fontSize: MAIN_FONT_SIZE,
  lineHeight: HEADER_FONT_SIZE + 2,
};
