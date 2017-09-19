import {StyleSheet} from 'react-native';
import {COLOR_LINK, COLOR_FONT} from '../variables/variables';

const FONT_SIZE = 16;

export default StyleSheet.create({
  textBaseStyle: {
    fontSize: FONT_SIZE,
    color: COLOR_FONT
  },
  a: {
    color: COLOR_LINK
  }
});
