import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/common-styles';
import {thumbSize} from 'components/attachments-row/attachments-row.styles';


export default EStyleSheet.create({
  container: {
    position: 'relative',
    marginRight: UNIT,
  },
  removeButton: {
    position: 'absolute',
    top: UNIT / 2,
    right: UNIT / 2,
  },
  size: thumbSize,
  link: {
    color: '$link',
  },
});
