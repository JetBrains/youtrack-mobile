import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  counter: {
    marginBottom: -1,
    marginRight: UNIT / 4,
  },
  counterText: {
    ...secondaryText,
    fontWeight: '500',
    color: '$icon',
  },
  iconDisabled: {
    color: '$disabled',
  },
  iconEnabled: {
    color: '$icon',
  },
  link: {
    color: '$link',
  },
});
