import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  commentVisibility: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVisibilityText: {
    color: 'rgba(72,128,159,0.8)',
    marginLeft: UNIT / 1.5,
  },
  commentIcon: {
    marginLeft: -1,
    color: 'rgba(113,164,196,0.5)',
  },
});
