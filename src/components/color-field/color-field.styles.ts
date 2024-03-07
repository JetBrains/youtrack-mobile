import EStyleSheet from 'react-native-extended-stylesheet';

import {COLOR_FIELD_SIZE} from 'components/color-field/color-field';
import {monospace, SECONDARY_FONT_SIZE, secondaryText} from 'components/common-styles';

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 1,
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
  textMonospace: {
    ...monospace,
  },
  defaultColorCoding: {
    color: '$text',
    borderColor: '$disabled',
    borderWidth: 0.5,
    backgroundColor: '$boxBackground',
  },
});
