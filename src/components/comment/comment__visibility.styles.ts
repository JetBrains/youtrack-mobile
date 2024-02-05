import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  commentVisibility: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVisibilityText: {
    color: '$yellowColor',
    marginLeft: UNIT / 1.5,
  },
  commentIcon: {
    marginLeft: -1,
    alignSelf: 'flex-start',
    color: '$yellowColor',
  },
});
