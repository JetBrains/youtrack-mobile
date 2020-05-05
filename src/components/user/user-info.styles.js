import {StyleSheet} from 'react-native';
import {UNIT, COLOR_ICON_MEDIUM_GREY} from '../../components/variables/variables';

export default StyleSheet.create({
  user: {
    flexDirection: 'row'
  },
  userName: {
    flex: 0,
    marginRight: UNIT / 2,
    marginLeft: UNIT,
    color: COLOR_ICON_MEDIUM_GREY
  },
  userAvatar: {
    borderRadius: 4
  },
  timestamp: {
    color: COLOR_ICON_MEDIUM_GREY,
  },
});
