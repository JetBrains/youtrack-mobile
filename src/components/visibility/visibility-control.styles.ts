import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    marginRight: UNIT * 2,
  },
  buttonIcon: {
    marginRight: UNIT,
  },
  buttonText: {...secondaryText, color: '$yellowColor'},
  link: {
    color: 'link',
  },
});
