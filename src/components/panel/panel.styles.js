import EStyleSheet from 'react-native-extended-stylesheet';

import {separator} from '../common-styles/list';
import {UNIT} from '../variables/variables';

const HEIGHT = UNIT * 12;

export default EStyleSheet.create({
  panelWithSeparator: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    height: HEIGHT,
    paddingLeft: UNIT,
  },
  separator: {
    ...separator,
    borderColor: '$separator',
  },
});
