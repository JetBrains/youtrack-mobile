import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
export default EStyleSheet.create({
  container: {
    backgroundColor: '$boxBackground',
    padding: UNIT / 2,
    paddingHorizontal: UNIT / 1.5,
  },
  text: {
    color: '$yellowColor',
  },
});