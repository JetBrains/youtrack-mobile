import {StyleSheet} from 'react-native';
import {COLOR_FONT_ON_BLACK, UNIT} from '../variables/variables';

const defaultSize = 40;
const commonStyle = {
  justifyContent: 'center',
  borderRadius: 3
};

export default StyleSheet.create({
  common: {
    ...commonStyle,
  },
  size80: {
    width: defaultSize * 2,
    height: defaultSize * 2,
    borderRadius: UNIT
  },
  size40: {
    width: defaultSize,
    height: defaultSize
  },
  size20: {
    width: defaultSize / 2,
    height: defaultSize / 2
  },
  text: {
    fontFamily: 'Arial',
    color: COLOR_FONT_ON_BLACK,
    fontWeight: '600',
    textAlign: 'center'
  }
});
