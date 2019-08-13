import {StyleSheet} from 'react-native';
import {
  COLOR_FONT_GRAY,
  COLOR_PINK,
  COLOR_FONT_ON_BLACK,
  UNIT,
  COLOR_PLACEHOLDER_ACTIVE
} from '../variables/variables';

const SELECTED_ALPHA_HEX = 20;

const sidePadding = {
  paddingLeft: UNIT,
  paddingRight: UNIT,
};

const font = {
  fontFamily: 'System'
};

export default StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: UNIT,
    flexDirection: 'column'
  },
  wrapperActive: {
    backgroundColor: `${COLOR_PINK}${SELECTED_ALPHA_HEX}`
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flexGrow: 3,
    ...sidePadding
  },
  keyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    ...sidePadding
  },
  keyLockedIcon: {
    width: 9,
    height: 12,
    marginRight: UNIT / 2,
    marginTop: -1,
    resizeMode: 'contain',
    tintColor: '#66757e'
  },
  keyText: {
    color: COLOR_PLACEHOLDER_ACTIVE,
    fontSize: 12,
    ...font,
  },
  valueText: {
    marginRight: 0,
    paddingTop: UNIT / 2,
    color: COLOR_PINK,
    ...font,
    fontSize: 14,
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
    paddingBottom: 1
  },
  colorMarker: {
    flexGrow: 1,
    height: 3
  }
});
