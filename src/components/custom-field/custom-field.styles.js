import {StyleSheet} from 'react-native';
import {COLOR_FONT_GRAY, COLOR_PINK, COLOR_FONT_ON_BLACK, UNIT} from '../variables/variables';

const SELECTED_ALPHA_HEX = 20;

export default StyleSheet.create({
  wrapper: {
    padding: 8,
    paddingTop: 6
  },
  wrapperActive: {
    backgroundColor: `${COLOR_PINK}${SELECTED_ALPHA_HEX}`
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  keyWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  keyLockedIcon: {
    width: 9,
    height: 12,
    marginRight: UNIT / 2,
    marginTop: -(UNIT / 3),
    resizeMode: 'contain'
  },
  keyText: {
    color: COLOR_FONT_GRAY,
    paddingBottom: 2,
    fontSize: 11,
    fontFamily: 'System'
  },
  valueText: {
    color: COLOR_PINK,
    fontFamily: 'System',
    fontSize: 16,
    marginRight: 0,
    paddingTop: 2,
    paddingBottom: 3
  },
  valueTextActive: {
    color: COLOR_FONT_ON_BLACK,
  },
  valueTextDisabled: {
    color: COLOR_FONT_GRAY
  },
  colorMarkerContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0
  },
  colorMarker: {
    flexGrow: 1,
    height: 3
  }
});
