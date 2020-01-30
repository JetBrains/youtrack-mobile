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
    flexDirection: 'column',
    paddingTop: UNIT * 1.5
  },
  menuItems: {
    flexGrow: 2,
    padding: UNIT * 2,
    paddingTop: UNIT,
  },
  menuFooter: {
    padding: UNIT * 2,
    paddingTop: UNIT * 4
  },
  spacer: {
    marginTop: UNIT
  },
  footerText: {
    fontSize: 12,
    lineHeight: UNIT * 2,
    color: COLOR_GRAY
  },
  buttonLink: {
    padding: UNIT,
    paddingLeft: 0
  },
  linkText: {
    color: COLOR_PINK,
    fontSize: 12
  }
});
