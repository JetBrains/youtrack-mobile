import {StyleSheet, Platform} from 'react-native';
import {COLOR_LINK, COLOR_FONT, COLOR_GRAY, UNIT, COLOR_FONT_GRAY} from '../variables/variables';

const FONT_SIZE = 16;

export default StyleSheet.create({
  htmlView: {
    fontSize: FONT_SIZE,
    color: COLOR_FONT,
    textAlign: 'left',
    writingDirection: 'ltr'
  },
  monospace: {
    ...Platform.select({
      ios: {
        fontFamily: 'Courier New'
      },
      android: {
        fontFamily: 'Droid Sans Mono'
      }
    })
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
  }
});

export const htmlViewStyles = StyleSheet.create({
  a: {
    color: COLOR_LINK,
    textDecorationLine: 'underline'
  }
});
