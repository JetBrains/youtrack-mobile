import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
export default EStyleSheet.create({
  commentVisibility: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVisibilityText: {
    color: '$icon',
    marginLeft: UNIT / 1.5,
  },
});