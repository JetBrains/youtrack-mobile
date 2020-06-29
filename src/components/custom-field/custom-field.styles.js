import {StyleSheet} from 'react-native';
import {
  COLOR_PINK,
  COLOR_FONT,
  UNIT,
} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/typography';

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
    flexDirection: 'column',
    justifyContent: 'center'
  },
  wrapperActive: {
    backgroundColor: `${COLOR_PINK}${SELECTED_ALPHA_HEX}`
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    ...sidePadding
  },
  keyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    ...sidePadding
  },
  keyText: {
    marginBottom: UNIT / 2,
    ...secondaryText,
    ...font
  },
  value: {
    flexDirection: 'row',
  },
  valueText: {
    marginRight: 0,
    ...mainText,
    ...font,
    color: COLOR_PINK
  },
  valueTextActive: {
    color: COLOR_FONT,
  },
  valueTextDisabled: {
    color: COLOR_FONT
  },
  colorMarker: {
    marginRight: UNIT
  }
});
