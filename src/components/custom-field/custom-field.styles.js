import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/typography';


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
});
