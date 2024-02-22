import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, UNIT} from 'components/common-styles';
import {separatorBorder} from 'components/common-styles/list';
import {StyleSheet} from 'react-native';

export default EStyleSheet.create({
  rowSeparator: {
    borderColor: '$separator',
    ...separatorBorder,
    height: 1,
  },
  headerText: {
    ...mainText,
    color: '$text',
    fontWeight: '500',
  },
  action: {
    paddingVertical: UNIT * 1.5,
    paddingHorizontal: UNIT * 2,
  },
  actionText: {
    ...mainText,
    color: '$link',
  },
  actionTextDisabled: {
    color: '$icon',
  },
  icon: {
    alignSelf: 'flex-start',
    padding: UNIT / 4,
    color: '$private',
  },
  progress: {
    ...StyleSheet.absoluteFillObject,
  },
});
