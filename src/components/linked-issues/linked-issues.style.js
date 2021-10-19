import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText} from '../common-styles/typography';
import {SELECT_ITEM_HEIGHT} from '../select/select.styles';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  linkedIssuesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: -UNIT * 2,
    marginVertical: UNIT * 2,
    paddingRight: UNIT * 2.5,
    paddingVertical: UNIT * 2,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: '$separator',
  },
  linkedIssuesTitle: {
    flex: 0.95,
  },
  linkedIssuesTitleText: {
    color: '$icon',
    marginBottom: UNIT / 2,
  },

  link: {
    color: '$link',
  },
  linkedList: {
    padding: UNIT * 2,
    paddingBottom: SELECT_ITEM_HEIGHT,
  },
  linkedIssue: {
    paddingVertical: UNIT * 1.5,
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
    color: '$icon',
    ...secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
