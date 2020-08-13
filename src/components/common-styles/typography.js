import {Platform} from 'react-native';

import {COLOR_DARK, COLOR_FONT_GRAY, COLOR_FONT_ON_BLACK, COLOR_ICON_MEDIUM_GREY} from '../variables/variables';

export const HEADER_FONT_SIZE = 20;

export const MAIN_FONT_SIZE = 16;

export const SECONDARY_FONT_SIZE = 14;

export const resolvedTextColor = {
  color: COLOR_FONT_GRAY
};

export const monospaceFontAndroid = 'monospace';
export const monospaceFontIOS = 'Menlo';
export const monospace = {
  ...Platform.select({
    ios: {
      fontFamily: monospaceFontIOS
    },
    android: {
      fontFamily: monospaceFontAndroid
    }
  })
};

export const headerTitle = {
  color: COLOR_DARK,
  fontSize: HEADER_FONT_SIZE,
  letterSpacing: 0.13,
  backgroundColor: COLOR_FONT_ON_BLACK,

  ...Platform.select({
    ios: {
      fontWeight: '700',
    },
    android: {
      fontWeight: '500',
    }
  }),
};

export const secondaryText = {
  color: COLOR_ICON_MEDIUM_GREY,
  fontSize: SECONDARY_FONT_SIZE,
  letterSpacing: -0.17
};

export const mainText = {
  fontSize: MAIN_FONT_SIZE,
  lineHeight: 20,
  letterSpacing: -0.19
};
