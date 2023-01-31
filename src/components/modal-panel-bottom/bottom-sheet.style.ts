import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: '$background',
  },
  container: {
    flex: 1,
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2,
  },
  content: {
    padding: UNIT,
    paddingBottom: UNIT * 2,
  },
});
