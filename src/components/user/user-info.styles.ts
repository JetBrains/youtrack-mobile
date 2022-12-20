import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
export default EStyleSheet.create({
  user: {
    flexDirection: 'row',
  },
  userName: {
    flex: 0,
    marginRight: UNIT / 2,
    marginLeft: UNIT * 2,
    color: '$icon',
  },
  userAvatar: {
    flex: 0,
    borderRadius: UNIT / 2,
  },
  timestampContainer: {
    flexGrow: 1,
    marginRight: UNIT * 2,
    alignItems: 'flex-end',
  },
  timestamp: {
    color: '$icon',
  },
});
