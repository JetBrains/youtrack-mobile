import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_GRAY,
  COLOR_FONT_ON_BLACK, COLOR_FONT
} from '../../components/variables/variables';

const bottomBorder = {
  borderColor: COLOR_FONT,
  borderBottomWidth: 0.5
};

export default StyleSheet.create({
  menuItem: {
    paddingTop: UNIT / 2,
    paddingBottom: UNIT * 2,
    marginBottom: UNIT,
    ...bottomBorder
  },
  menuItemTopLine: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemIcon: {
    height: UNIT * 2,
    resizeMode: 'contain'
  },
  menuItemText: {
    lineHeight: 18,
    fontSize: 17,
    fontWeight: 'bold',
    color: COLOR_FONT_ON_BLACK
  },
  menuItemSubtext: {
    lineHeight: 19,
    paddingTop: UNIT / 2,
    color: COLOR_GRAY,
    fontSize: 14
  }
});
