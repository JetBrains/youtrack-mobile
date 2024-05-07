import EStyleSheet from 'react-native-extended-stylesheet';

import {rotate45} from './icon.styles';
import {UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  icon: {
    color: '$icon',
    padding: UNIT / 2,
    marginLeft: UNIT,
    marginRight: UNIT,
    borderRadius: UNIT * 2,
    ...rotate45,
  },
});
