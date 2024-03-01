import EStyleSheet from 'react-native-extended-stylesheet';

import * as commonStyles from 'components/common-styles';
import {UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  tabBar: {
    height: commonStyles.menuHeight,
    paddingTop: UNIT / 2,
    backgroundColor: '$background',
    borderTopColor: '$separator',
    borderTopWidth: 0.6,
  },
  tabBarItem: {
  },
  icon: {
    color: '$navigation',
  },
  link: {
    color: '$link',
  },
  circleIcon: {
    position: 'absolute',
    top: 0,
    left: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '$background',
    backgroundColor: '$background',
  },
  navIcon: {
    padding: UNIT,
  },
});
