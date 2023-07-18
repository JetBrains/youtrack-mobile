import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: '$background',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: UNIT,
    marginBottom: UNIT * 2,
  },
});
