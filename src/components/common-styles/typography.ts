import {Platform} from 'react-native';


export const HEADER_FONT_SIZE = 20;

export const MAIN_FONT_SIZE = 16;

export const SECONDARY_FONT_SIZE = 14;

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
  lineHeight: 20,
  letterSpacing: -0.19,
};

export const markdownText = {
  fontSize: MAIN_FONT_SIZE,
  lineHeight: 22,
};
