import {StyleSheet} from 'react-native';
import HEADER_TOP_PADDING from '../../components/header/header__top-padding';
import {COLOR_PINK, UNIT, COLOR_FONT_GRAY} from '../../components/variables/variables';

const AVATAR_SIZE = UNIT * 8;

export default StyleSheet.create({
  menuContainer: {
    marginTop: HEADER_TOP_PADDING,
    flex: 1
  },
  profileContainer: {
    alignItems: 'center'
  },
  profileName: {
    color: COLOR_FONT_GRAY,
    marginTop: UNIT
  },
  currentUserAvatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE/2
  },
  logOutButton: {
    marginTop: UNIT * 2,
    alignItems: 'center',
    height: UNIT * 4
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
