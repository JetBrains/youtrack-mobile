import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1, HEADER_FONT_SIZE, mainText, UNIT, layout} from 'components/common-styles';


export default EStyleSheet.create({
  ...layout,
  selector: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  selectorBorder: {...elevation1},
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: UNIT,
    paddingLeft: 0,
    marginBottom: UNIT,
  },
  selectorButtonText: {
    ...mainText,
    lineHeight: null,
    fontWeight: '500',
    color: '$text',
  },
  selectorButtonTextDisabled: {
    color: '$icon',
  },
  selectorIcon: {
    lineHeight: HEADER_FONT_SIZE,
  },
  selectItemLeftButton: {
    marginRight: UNIT * 1.5,
    padding: UNIT / 2,
    paddingRight: UNIT,
  },
});
