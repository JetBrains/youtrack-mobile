import EStyleSheet from 'react-native-extended-stylesheet';
const defaultSize = 40;
const commonStyle = {
  justifyContent: 'center',
};
export default EStyleSheet.create({
  common: {
    ...commonStyle,
    backgroundColor: '$disabled',
  },
  size80: {
    width: defaultSize * 2,
    height: defaultSize * 2,
    borderRadius: defaultSize * 2,
  },
  size40: {
    width: defaultSize,
    height: defaultSize,
    borderRadius: defaultSize,
  },
  size20: {
    width: defaultSize / 2,
    height: defaultSize / 2,
    borderRadius: defaultSize / 2,
  },
  text: {
    fontFamily: 'Arial',
    color: '$text',
    fontWeight: '600',
    textAlign: 'center',
  },
});
