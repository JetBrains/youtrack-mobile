import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../common-styles/shadow';
import {headerMinHeight, headerTitlePresentation} from '../header/header.styles';
import {SECONDARY_FONT_SIZE, secondaryText} from '../common-styles/typography';
import {selectButtonMinHeight} from '../select/select-button.styles';
import {separatorBorder} from '../common-styles/list';
import {StyleSheet} from 'react-native';
import {UNIT} from '../variables/variables';

const linkTypeSelect = {
  marginTop: UNIT * 3,
  marginBottom: UNIT,
  marginHorizontal: UNIT * 2,
};

const searchPanel = {
  marginHorizontal: UNIT * 2,
  marginTop: UNIT,
  marginBottom: UNIT * 2,
};

export default EStyleSheet.create({
  container: {
    flexGrow: 1,
  },
  link: {
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  linkedListContainer: {
    marginTop: UNIT * 2,
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
    paddingVertical: UNIT * 1.5,
    marginBottom: UNIT / 2,
    marginRight: -UNIT * 2,
    backgroundColor: '$background',
    opacity: 0.9,
    color: '$icon',
    ...secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addLinkButton: {
    padding: UNIT * 1.5,
  },
  linkTypeSelect: linkTypeSelect,
  issuesToLinkContainer: {
    marginBottom: headerMinHeight + selectButtonMinHeight +
      linkTypeSelect.marginTop + linkTypeSelect.marginBottom +
      selectButtonMinHeight + searchPanel.marginTop + searchPanel.marginBottom,
  },
  headerTitle: {
    ...headerTitlePresentation,
    marginLeft: 0,
  },
  headerSubTitle: {
    lineHeight: SECONDARY_FONT_SIZE,
    color: '$icon',
  },
  searchPanelContainer: {
    backgroundColor: '$background',
    ...elevation1,
  },
  searchPanel: searchPanel,
  loader: StyleSheet.absoluteFillObject,
  noIssuesMessage: {
    marginLeft: -UNIT * 4,
    marginBottom: -UNIT * 2,
  },

  linkedIssuesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: UNIT,
    marginRight: -UNIT * 2,
    marginBottom: UNIT / 2,
    paddingTop: UNIT,
    paddingRight: UNIT * 2.5,
    paddingVertical: UNIT * 2,
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
  linkedIssuesTitleTextDetails: {
    color: '$text',
  },
});
