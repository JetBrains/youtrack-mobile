import EStyleSheet from 'react-native-extended-stylesheet';

import {SECONDARY_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';
import {COLOR_FIELD_SIZE} from 'components/color-field/color-field';


export default EStyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    paddingVertical: UNIT / 4,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  wrapperOneChar: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE,
  },
  text: {
    ...secondaryText,
    fontSize: SECONDARY_FONT_SIZE - 1,
    textAlign: 'center',
  },
  defaultColorCoding: {
    color: '$text',
    borderColor: '$disabled',
    borderWidth: 0.5,
    backgroundColor: '$boxBackground',
  },
});
