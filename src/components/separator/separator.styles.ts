import EStyleSheet from 'react-native-extended-stylesheet';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from 'components/variables';
const rowSeparator = {
  height: 1,
  borderColor: '$separator',
  ...separatorBorder,
};
const rowSeparatorFit = {...rowSeparator, marginRight: -UNIT * 2};
export default EStyleSheet.create({
  ...{
    rowSeparator,
  },
  ...{
    rowSeparatorFit,
  },
  indent: {
    marginTop: UNIT * 3,
  },
});
