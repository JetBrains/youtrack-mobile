import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    flexDirection: 'row',
  },
  title: {
    color: '$icon',
  },
  toggle: {
    color: '$link',
  },
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    color: '$link',
  },
});
