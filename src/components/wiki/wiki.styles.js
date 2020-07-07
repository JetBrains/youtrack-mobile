import {StyleSheet, Platform} from 'react-native';
import {COLOR_LINK, COLOR_FONT, COLOR_GRAY, UNIT, COLOR_FONT_GRAY, COLOR_PINK} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from '../common-styles/typography';

const monospace = {
  ...Platform.select({
    ios: {
      fontFamily: 'CourierNewPSMT'
    },
    android: {
      fontFamily: 'Droid Sans Mono'
    }
  })
};

const link = {
  marginBottom: UNIT * 2,
  fontFamily: 'System',
  fontSize: SECONDARY_FONT_SIZE,
  textAlign: 'center',
  color: COLOR_PINK
};

export default StyleSheet.create({
  htmlView: {
    fontSize: MAIN_FONT_SIZE,
    color: COLOR_FONT,
    textAlign: 'left',
    writingDirection: 'ltr'
  },
  monospace: {
    ...monospace
  },
  deleted: {
    textDecorationLine: 'line-through'
  },
  blockQuote: {
    color: COLOR_FONT_GRAY,
    borderLeftWidth: 2,
    borderLeftColor: COLOR_GRAY,
    paddingLeft: UNIT / 2
  },
  unspaced: {
    margin: 0
  },
  codeLink: link,
  exceptionLink: link,
  code: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '500',
  }
});

export const htmlViewStyles = StyleSheet.create({
  a: {
    color: COLOR_LINK,
    textDecorationLine: 'underline'
  }
});
