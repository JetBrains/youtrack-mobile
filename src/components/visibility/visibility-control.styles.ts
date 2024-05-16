import {Platform} from 'react-native';

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
    marginRight: UNIT / 1.5,
    ...Platform.select({
      ios: {
        marginTop: -UNIT / 4,
      },
    }),
  },
  buttonText: {...secondaryText, color: '$textSecondary'},
  link: {
    color: '$link',
  },
});
