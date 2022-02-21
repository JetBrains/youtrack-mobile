import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 8,
    height: '100%',
    backgroundColor: '$background',
  },
  indicator: {
    height: 4,
    opacity: 0.5,
    backgroundColor: '$textSecondary',
  },
});
