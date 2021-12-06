import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  box: {
    flex: 1,
  },
  modal: {
    marginVertical: UNIT * 7,
    borderRadius: 18,
  },
  modalContent: {
    flex: 1,
    width: 704,
    backgroundColor: '$background',
  },
});
