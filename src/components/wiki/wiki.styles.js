import {StyleSheet, Platform} from 'react-native';
import {COLOR_LIGHT_GRAY, COLOR_GRAY, COLOR_LINK, COLOR_FONT, COLOR_FONT_GRAY, UNIT} from '../variables/variables';

const FONT_SIZE = 16;

export default StyleSheet.create({
  commonTextItem: {
    fontSize: FONT_SIZE
  },
  text: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE
  },
  heading: {
    color: COLOR_FONT,
    fontSize: 24
  },
  strong: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    fontWeight: 'bold'
  },
  monospace: {
    fontSize: FONT_SIZE,
    ...Platform.select({
      ios: {
        fontFamily: 'Courier New'
      },
      android: {
        fontFamily: 'Droid Sans Mono'
      }
    })
  },
  underline: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    textDecorationLine: 'underline'
  },
  del: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    textDecorationLine: 'line-through'
  },
  italic: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    fontStyle: 'italic'
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  },
  link: {
    color: COLOR_LINK,
    fontSize: FONT_SIZE,
    textDecorationLine: 'underline'
  },
  issueLinkResolved: {
    color: COLOR_FONT_GRAY,
    fontSize: FONT_SIZE,
    textDecorationLine: 'line-through'
  },
  codeBlock: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    backgroundColor: COLOR_LIGHT_GRAY,
    fontFamily: 'Courier'
  },
  cutBlock: {
    fontSize: FONT_SIZE,
    color: COLOR_FONT,
    backgroundColor: COLOR_LIGHT_GRAY,
    fontFamily: 'Courier'
  },
  inlineCode: {
    color: COLOR_FONT,
    fontSize: FONT_SIZE,
    fontFamily: 'Courier'
  },
  blockQuote: {
    borderLeftWidth: 2,
    borderLeftColor: COLOR_GRAY,
    paddingLeft: UNIT/2
  }
});
