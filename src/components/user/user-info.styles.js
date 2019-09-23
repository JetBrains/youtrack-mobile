import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  user: {
    flexDirection: 'row'
  },
  userName: {
    flex: 0,
    marginRight: UNIT / 2,
    marginLeft: UNIT,
    color: COLOR_FONT,
    fontWeight: 'bold'
  },
  timestamp: {
    color: COLOR_FONT,
  },
});
