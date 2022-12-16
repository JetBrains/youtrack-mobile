import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, secondaryText} from '../common-styles/typography';
import {UNIT} from '../variables/variables';


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
    color: '$icon',
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
  colorMarker: {
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
});
