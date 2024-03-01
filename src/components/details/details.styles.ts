import EStyleSheet from 'react-native-extended-stylesheet';

import {SECONDARY_FONT_SIZE} from 'components/common-styles';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  button: {
    flexDirection: 'row',
  },
  title: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
  },
  buttonText: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$link',
  },
});
