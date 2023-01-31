import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: UNIT * 2,
    backgroundColor: '$background',
  },
  markdownScroll: {
    paddingTop: 0,
    padding: UNIT * 2,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: UNIT * 2,
    alignItems: 'center',
  },
  buttonText: {
    color: '$link',
  },
  buttonTextDisabled: {
    color: '$icon',
  },
});
