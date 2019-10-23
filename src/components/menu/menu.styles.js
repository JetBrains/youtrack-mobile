import {StyleSheet} from 'react-native';
import {COLOR_PINK, UNIT, COLOR_GRAY, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  accounts: {
    borderColor: COLOR_FONT,
    borderBottomWidth: 0.5
  },
  scrollContainer: {
    backgroundColor: 'black'
  },
  menuContainer: {
    flex: 1,
    backgroundColor: 'black'
  },
  menuItems: {
    paddingRight: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT * 2,
    marginLeft: UNIT * 2,
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
  buttonLink: {},
  linkText: {
    color: COLOR_PINK,
    fontSize: 12
  }
});
