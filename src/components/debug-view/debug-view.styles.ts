import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: UNIT * 2,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '$link',
  },
});
