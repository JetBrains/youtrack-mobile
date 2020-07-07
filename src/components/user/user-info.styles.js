import {StyleSheet} from 'react-native';
import {UNIT, COLOR_ICON_MEDIUM_GREY} from '../../components/variables/variables';

export default StyleSheet.create({
  user: {
    flexDirection: 'row'
  },
  userName: {
    flex: 0,
    marginRight: UNIT / 2,
    marginLeft: UNIT * 2,
    color: COLOR_ICON_MEDIUM_GREY
  },
  userAvatar: {
    flex: 0,
    borderRadius: 4
  },
  timestampContainer: {
    flexGrow: 1,
    marginRight: UNIT * 2,
    alignItems: 'flex-end',
  },
  timestamp: {
    color: COLOR_ICON_MEDIUM_GREY,
  },
});
