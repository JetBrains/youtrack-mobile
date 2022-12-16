import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';

export default EStyleSheet.create({
  attachButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachButton: {
    flexDirection: 'row',
    paddingVertical: UNIT * 1.5,
  },
  attachButtonText: {
    ...mainText,
    marginLeft: UNIT * 2,
    color: '$link',
  },
  attachButtonTextDisabled: {
    color: '$textSecondary',
  },
});
