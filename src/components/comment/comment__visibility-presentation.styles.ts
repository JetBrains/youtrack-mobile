import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  commentVisibility: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVisibilityText: {
    color: '$private',
  },
  commentIcon: {
    paddingLeft: UNIT / 4,
    color: '$private',
  },
  commentIconFirst: {
    paddingRight: UNIT / 4,
  },
});
