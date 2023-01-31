import EStyleSheet from 'react-native-extended-stylesheet';
import {mainText} from 'components/common-styles/typography';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from 'components/variables';
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  featuresListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: UNIT * 2,
    ...separatorBorder,
    borderColor: '$separator',
  },
  featuresListItemText: {
    flexGrow: 1,
    ...mainText,
    color: '$text',
  },
  closeButton: {
    paddingLeft: UNIT,
    color: '$link',
  },
  button: {...mainText, color: '$link', padding: UNIT, paddingLeft: 0},
});
