import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/variables';
import {MAIN_FONT_SIZE} from 'components/common-styles';

export default EStyleSheet.create({
  modal: {

  },
  buttons: {
    alignSelf: 'flex-end',
    marginTop: UNIT,
    marginBottom: UNIT,
    marginRight: -UNIT,
  },
  button: {
    marginLeft: UNIT,
    padding: UNIT,
    paddingRight: UNIT * 2,
    paddingLeft: UNIT * 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$link',
  },
});
