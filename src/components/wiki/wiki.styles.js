import {StyleSheet} from 'react-native';
import {COLOR_LIGHT_GRAY, COLOR_LINK} from '../variables/variables';

export default StyleSheet.create({
  heading: {
    fontSize: 24
  },
  strong: {
    fontWeight: 'bold'
  },
  underline: {
    textDecorationLine: 'underline'
  },
  del: {
    textDecorationLine: 'line-through'
  },
  italic: {
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
    backgroundColor: COLOR_LIGHT_GRAY,
    fontFamily: 'Courier'
  },
  inlineCode: {
    fontFamily: 'Courier'
  }
});
