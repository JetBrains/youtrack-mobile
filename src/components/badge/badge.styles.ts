import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
export default EStyleSheet.create({
  badge: {
    paddingHorizontal: UNIT / 2,
    fontSize: 13,
    color: '$icon',
    borderWidth: 1,
    borderColor: '$disabled',
    borderRadius: UNIT / 2,
  },
  badgeValid: {
    color: '#1b8833',
  },
});
