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
    ...elevationTop,
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemButton: {
    flexGrow: 0.5,
    minWidth: UNIT * 5,
    height: UNIT * 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuProgressContainer: {
    position: 'absolute',
    top: -1,
    height: 2,
    width: '100%',
  },
  link: {
    color: '$link',
  },
  linkLight: {
    color: '$linkLight',
  },
  disabled: {
    color: '$disabled',
  },
  icon: {
    color: '$navigation',
  },
  circleIcon: {
    position: 'absolute',
    top: -10,
    left: 18,
  },
});
