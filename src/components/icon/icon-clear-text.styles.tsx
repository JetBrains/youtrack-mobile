import EStyleSheet from 'react-native-extended-stylesheet';

import {clearIcon} from 'components/common-styles/search';
import {rotate45} from './icon.styles';
import {UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  icon: {
    ...clearIcon,
    marginLeft: UNIT,
    marginRight: UNIT,
    borderRadius: UNIT,
    ...rotate45,
  },
});
