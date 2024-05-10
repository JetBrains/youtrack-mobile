import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from 'components/common-styles';


export const rotate45 = {
  transform: [{rotate: '45deg'}],
};
export const rotate90 = {
  transform: [{rotate: '90deg'}],
};
export default EStyleSheet.create({
  iconMoreOptionsAndroid: {
    paddingHorizontal: UNIT / 2,
    ...rotate90,
  },
});
