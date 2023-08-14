import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/common-styles';
import {clearIcon} from 'components/common-styles/search';


export default EStyleSheet.create({
  icon: {
    ...clearIcon,
    marginLeft: UNIT,
    marginRight: UNIT,
  },
});
