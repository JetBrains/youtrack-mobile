import {StyleSheet} from 'react-native';
import {COLOR_PINK, UNIT, COLOR_GRAY, COLOR_FONT} from '../../components/variables/variables';

const AVATAR_SIZE = UNIT * 8;

const bottomBorder = {
  borderColor: COLOR_FONT,
  borderBottomWidth: 0.5
};

export default StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: 'black'
  },
  profileContainer: {
    alignItems: 'center',
    paddingBottom: UNIT * 2,
    ...bottomBorder
  },
  profileName: {
    color: COLOR_GRAY,
    marginTop: UNIT
  },
  logoutIcon: {
    height: UNIT * 3,
    resizeMode: 'contain'
  },
  currentUserAvatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE/2
  },
  logOutButton: {
    position: 'absolute',
    right: UNIT
  },
  menuItems: {

  },
  menuItemButton: {
    paddingRight: UNIT * 2,
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    ...bottomBorder
  },
  menuItemTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  menuItemIcon: {
    height: UNIT * 2,
    resizeMode: 'contain'
  },
  menuItemText: {
    lineHeight: 18,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white'
  },
  menuItemSubtext: {
    lineHeight: 19,
    paddingTop: UNIT/2,
    color: COLOR_GRAY,
    fontSize: 14
  },
  flexSpacer: {
    flexGrow: 1
  },
  menuFooter: {
    padding: UNIT*2
  },
  spacer: {
    marginTop: UNIT
  },
  footerText: {
    fontSize: 12,
    lineHeight: UNIT*2,
    color: COLOR_GRAY
  },
  buttonLink: {
  },
  linkText: {
    color: COLOR_PINK,
    fontSize: 12
  }
});
