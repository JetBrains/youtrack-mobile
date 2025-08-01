import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$background',
  },
  content: {
    flex: 1,
    backgroundColor: '$background',
  },
  leftAction: {
    flexGrow: 1,
    paddingLeft: UNIT,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '$blueBackground',
  },
  leftActionText: {
    color: '$blueColor',
  },
  rightAction: {
    flexGrow: 1,
    paddingRight: UNIT,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '$greenBackground',
  },
  rightActionText: {
    textAlign: 'right',
    color: '$text',
  },
});
