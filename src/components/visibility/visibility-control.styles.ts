import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {secondaryText} from '../common-styles/typography';
export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    marginRight: UNIT * 2,
  },
  buttonIcon: {
    marginRight: UNIT,
  },
  buttonText: {...secondaryText, color: '$icon'},
}) as any;
