import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {COLOR_FIELD_SIZE} from 'components/color-field/color-field';
import {
  MAIN_FONT_SIZE,
  mainText,
  secondaryText,
} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';
const sidePadding = {
  paddingLeft: UNIT,
  paddingRight: UNIT,
};
const font = {
  fontFamily: 'System',
};
export default EStyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  wrapperActive: {
    backgroundColor: '$linkLight',
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    ...sidePadding,
  },
  keyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    ...sidePadding,
  },
  keyText: {
    marginBottom: UNIT / 2,
    ...secondaryText,
    ...font,
    color: '$textSecondary',
  },
  value: {
    minWidth: UNIT * 4,
    flexDirection: 'row',
  },
  valueText: {
    marginRight: 0,
    ...mainText,
    ...font,
    color: '$link',
  },
  valueTextActive: {
    color: '$text',
  },
  valueTextDisabled: {
    color: '$text',
  },
  valueTag: {
    marginVertical: -1,
    paddingVertical: 1,
    paddingHorizontal: UNIT / 1.5,
    marginRight: UNIT,
    backgroundColor: '$iconBackground',
    borderRadius: UNIT / 1.5,
  },
  valueTagText: {
    ...mainText,
    fontSize: MAIN_FONT_SIZE - 1,
  },
  valueAddIcon: {
    color: '$link',
    marginLeft: UNIT,
  },
  colorMarker: {
    minWidth: COLOR_FIELD_SIZE,
    minHeight: COLOR_FIELD_SIZE - 1,
    marginRight: UNIT,
  },
  url: {
    marginTop: UNIT / 2,
    marginLeft: UNIT * 1.5,
    marginRight: UNIT / 2,
    color: '$link',
  },
  issueTextField: {
    marginTop: UNIT * 2.5,
  },
  issueTextFieldTitle: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE + 3,
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontWeight: '700',
      },
    }),
  },
  error: {
    color: '$error',
  },
  selectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...mainText,
  },
  selectItemSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectItemSecondaryText: {
    paddingRight: UNIT,
    lineHeight: 55,
    ...secondaryText,
    color: '$icon',
  },
});
