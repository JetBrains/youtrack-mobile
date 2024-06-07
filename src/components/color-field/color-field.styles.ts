import EStyleSheet from 'react-native-extended-stylesheet';

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
    minWidth: 21,
    minHeight: 21,
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
