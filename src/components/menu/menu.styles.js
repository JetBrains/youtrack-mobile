import EStyleSheet from 'react-native-extended-stylesheet';

import {menuHeight} from '../common-styles/header';
import {elevationTop} from '../common-styles/shadow';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  menu: {
    height: menuHeight,
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...elevationTop
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemButton: {
    minWidth: UNIT * 5,
    minHeight: UNIT * 5,
    paddingHorizontal: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 11,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '$link'
  }
});
