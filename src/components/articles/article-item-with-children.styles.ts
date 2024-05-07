import EStyleSheet from 'react-native-extended-stylesheet';
import {SELECT_ITEM_HEIGHT} from '../select/select.styles';
import {UNIT} from 'components/variables';
import {mainText} from 'components/common-styles/typography';
export const articleItemWithChildrenStyles = {
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    height: SELECT_ITEM_HEIGHT,
    backgroundColor: '$background',
  },
  articleTitleText: {...mainText, maxWidth: '87%', color: '$text'},
  icon: {
    color: '$icon',
  },
  lockIcon: {
    color: '$private',
  },
  iconTrash: {
    color: '$error',
    padding: UNIT,
  },
  itemButtonContainer: {
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: UNIT * 5,
    height: UNIT * 4,
    paddingHorizontal: UNIT / 1.5,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground',
  },
  itemButtonText: {...mainText, paddingRight: UNIT, color: '$textSecondary'},
  itemButtonIcon: {
    marginTop: -1,
  },
};
export default EStyleSheet.create(articleItemWithChildrenStyles);
