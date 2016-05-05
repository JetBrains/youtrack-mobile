import {StyleSheet} from 'react-native';
import HEADER_TOP_PADDING from '../../components/header/header__top-padding';
import {COLOR_PINK, UNIT, COLOR_FONT_GRAY} from '../../components/variables/variables';

module.exports = StyleSheet.create({
  menuContainer: {
    marginTop: HEADER_TOP_PADDING,
    flex: 1
  },
  logOutButton: {
    alignItems: 'center'
  },
  logOutText: {
    color: COLOR_PINK
  },
  menuFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: UNIT*2,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: COLOR_FONT_GRAY
  }
});
