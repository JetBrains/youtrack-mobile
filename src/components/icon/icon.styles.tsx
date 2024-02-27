import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/common-styles';


export const rotate45 = {
  transform: [{rotate: '45deg'}],
};
export default EStyleSheet.create({
  iconMoreOptionsAndroid: {
    marginRight: -UNIT,
    paddingHorizontal: UNIT / 2,
    transform: [{rotate: '-90deg'}],
  },
});
