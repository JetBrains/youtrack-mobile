import {StyleSheet, Platform} from 'react-native';
import {COLOR_LIGHT_GRAY, COLOR_LINK, COLOR_FONT} from '../variables/variables';

export default StyleSheet.create({
  text: {
    color: COLOR_FONT
  },
  heading: {
    color: COLOR_FONT,
    fontSize: 24
  },
  strong: {
    color: COLOR_FONT,
    fontWeight: 'bold'
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
  underline: {
    color: COLOR_FONT,
    textDecorationLine: 'underline'
  },
  del: {
    color: COLOR_FONT,
    textDecorationLine: 'line-through'
  },
  italic: {
    color: COLOR_FONT,
    fontStyle: 'italic'
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  },
  link: {
    color: COLOR_LINK,
    textDecorationLine: 'underline'
  },
  codeBlock: {
    color: COLOR_FONT,
    backgroundColor: COLOR_LIGHT_GRAY,
    fontFamily: 'Courier'
  },
  cutBlock: {
    color: COLOR_FONT,
    backgroundColor: COLOR_LIGHT_GRAY,
    fontFamily: 'Courier'
  },
  inlineCode: {
    color: COLOR_FONT,
    fontFamily: 'Courier'
  }
});
