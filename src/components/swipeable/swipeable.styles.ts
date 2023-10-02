import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$background',
  },
  content: {
    flex: 1,
    backgroundColor: '$background',
  },
  leftAction: {
    position: 'relative',
    zIndex: 2,
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '$blueBackground',
  },
  leftActionText: {
    color: '$blueColor',
  },
  rightAction: {
    flexGrow: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '$greenBackground',
  },
  rightActionText: {
    textAlign: 'right',
    color: '$text',
  },
});
