import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText} from '../common-styles/typography';
import {SELECT_ITEM_HEIGHT} from '../select/select.styles';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  link: {
    color: '$link',
  },
  linkedList: {
    padding: UNIT * 2,
    paddingRight: UNIT,
    paddingBottom: SELECT_ITEM_HEIGHT,
  },
  linkedIssueItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: UNIT * 1.5,
  },
  linkedIssue: {
    flexGrow: 1,
    flexBasis: UNIT * 4,
  },
  linkedIssueRemoveAction: {
    padding: UNIT / 1.5,
    height: UNIT * 4,
    marginLeft: UNIT,
    color: '$iconAccent',
  },
  separator: {
    ...separatorBorder,
    marginRight: -UNIT * 2,
    borderBottomWidth: 1,
    borderColor: '$separator',
  },
  linkedIssueTypeTitle: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT,
    marginBottom: UNIT,
    backgroundColor: '$background',
    color: '$text',
    ...secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
