import {StyleSheet} from 'react-native';

const defaultSize = 40;
const commonStyle = {
  justifyContent: 'center',
  borderRadius: 3
};

export default StyleSheet.create({
  common: {
    ...commonStyle,
  },
  size40: {
    ...commonStyle,
    width: defaultSize,
    height: defaultSize
  },
  size20: {
    ...commonStyle,
    width: defaultSize / 2,
    height: defaultSize / 2
  },
  text: {
    fontFamily: 'Arial',
    color: '#FFF',
    fontWeight: '600'
  }
});
