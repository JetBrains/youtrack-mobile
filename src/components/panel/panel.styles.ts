import EStyleSheet from 'react-native-extended-stylesheet';
import {separator} from '../common-styles/list';
import {UNIT} from '../variables/variables';
export default EStyleSheet.create({
  panelWithSeparator: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    height: UNIT * 12,
    paddingLeft: UNIT,
  },
  separator: {...separator, borderColor: '$separator'},
});
