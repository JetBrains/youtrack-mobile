import {StyleSheet} from 'react-native';
import {COLOR_PINK, UNIT, COLOR_FONT_GRAY, COLOR_LINK} from '../../components/variables/variables';

const AVATAR_SIZE = UNIT * 8;

export default StyleSheet.create({
  menuContainer: {
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
    left: UNIT*2,
    right: UNIT*2,
    bottom: UNIT*2
  },
  spacer: {
    marginTop: UNIT
  },
  footerText: {
    fontSize: 12,
    lineHeight: UNIT*2,
    color: COLOR_FONT_GRAY
  },
  buttonLink: {
  },
  linkText: {
    color: COLOR_LINK,
    fontSize: 12
  }
});
