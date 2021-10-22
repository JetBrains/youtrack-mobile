import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText} from '../common-styles/typography';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from '../variables/variables';
import {headerMinHeight} from '../header/header.styles';
import {selectButtonMinHeight} from '../select/select-button.styles';

const linkTypeSelect = {
  marginTop: UNIT * 3,
  marginBottom: UNIT,
  marginHorizontal: UNIT * 2,
};

export default EStyleSheet.create({
  link: {
    color: '$link',
  },
  linkedListContainer: {
    marginBottom: headerMinHeight,
  },
  linkedList: {
    paddingHorizontal: UNIT * 2,
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
  addLinkButton: {
    padding: UNIT * 1.5,
  },
  linkTypeSelect: linkTypeSelect,
  issuesToLinkContainer: {
    marginBottom: headerMinHeight + selectButtonMinHeight + linkTypeSelect.marginTop + linkTypeSelect.marginBottom,
  },
});
