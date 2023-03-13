import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$background',
  },
  leftAction: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    maxWidth: '70%',
    paddingTop: UNIT * 4,
    paddingLeft: UNIT * 2,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '$blueBackground',
  },
  leftActionText: {
    color: '$blueColor',
  },
  rightAction: {
    flex: 1,
    maxWidth: '70%',
    paddingTop: UNIT * 4,
    paddingRight: UNIT * 2,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    backgroundColor: '$greenBackground',
  },
  rightActionText: {
    textAlign: 'right',
    color: '$text',
  },
});
