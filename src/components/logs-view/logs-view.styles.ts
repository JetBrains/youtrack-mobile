import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  container: {
    minWidth: '100%',
    height: '100%',
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
