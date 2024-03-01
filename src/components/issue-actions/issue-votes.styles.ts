import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  counter: {
    marginBottom: -2,
    marginRight: UNIT / 4,
  },
  counterText: {
    ...mainText,
    fontWeight: '500',
    fontSize: MAIN_FONT_SIZE,
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
