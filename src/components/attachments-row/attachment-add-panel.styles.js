import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';

export default EStyleSheet.create({
  attachButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UNIT,
    marginRight: UNIT
  },
  attachButton: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    flexDirection: 'row'
  },
  attachButtonText: {
    ...mainText,
    paddingLeft: UNIT,
    color: '$link'
  },
  attachButtonIcon: {
    transform: [{rotate: '-30deg'}]
  }
});
