import {StyleSheet, Platform} from 'react-native';
import {COLOR_FONT_GRAY, COLOR_PINK, COLOR_FONT} from '../variables/variables';
const SELECTED_ALPHA_HEX = 20;

export default StyleSheet.create({
  wrapper: {
    padding: 8
  },
  wrapperActive: {
    backgroundColor: `${COLOR_PINK}${SELECTED_ALPHA_HEX}`
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  keyText: {
    color: COLOR_FONT,
    paddingTop: 2,
    fontSize: 11,
    fontFamily: 'System'
  },
  valueText: {
    color: COLOR_FONT,
    fontWeight: 'bold',
    marginRight: 0,
    padding: 2,
    ...Platform.select({
      ios: {
        marginLeft: -2
      },
      android: {
        paddingRight: -1
      }
    })
  },
  valueTextDisabled: {
    color: COLOR_FONT_GRAY
  }
});
