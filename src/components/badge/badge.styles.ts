import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  badge: {
    paddingHorizontal: UNIT / 2,
    fontSize: 13,
    color: '$navigation',
    borderWidth: 1,
    borderColor: '$navigation',
    borderRadius: UNIT / 2,
  },
  badgeValid: {
    color: '#1b8833',
    borderColor: '$greenColor',
  },
});
