import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1} from 'components/common-styles';
import {
  headerMinHeight,
  headerTitlePresentation,
} from '../header/header.styles';
import {
  markdownText,
  SECONDARY_FONT_SIZE,
  secondaryText,
} from 'components/common-styles/typography';
import {selectButtonMinHeight} from '../select/select-button.styles';
import {separatorBorder} from '../common-styles/list';
import {StyleSheet} from 'react-native';
import {UNIT} from 'components/variables';
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
    backgroundColor: '$background',
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
  linkedIssue: {
    flexGrow: 1,
  },
  linkedList: {
    paddingHorizontal: UNIT * 2,
  },
  linkedIssueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: -UNIT * 2,
  },
  linkedIssueRemoveAction: {
    position: 'absolute',
    right: -UNIT * 2,
    zIndex: 1,
    alignSelf: 'center',
    marginLeft: UNIT,
    padding: UNIT,
    paddingHorizontal: UNIT / 2,
    color: '$iconAccent',
  },
  linkedIssueRemoveActionProgress: {
    position: 'absolute',
    right: UNIT * 1.5,
    zIndex: 1,
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
    marginRight: UNIT / 2,
  },
  linkTypeSelect: linkTypeSelect,
  issuesToLinkContainer: {
    marginBottom:
      headerMinHeight +
      selectButtonMinHeight +
      linkTypeSelect.marginTop +
      linkTypeSelect.marginBottom +
      selectButtonMinHeight +
      searchPanel.marginTop +
      searchPanel.marginBottom,
  },
  headerTitle: {...headerTitlePresentation, marginLeft: 0},
  headerSubTitle: {
    ...secondaryText,
    lineHeight: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
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
    marginTop: UNIT / 2,
    marginRight: -UNIT * 2,
    paddingRight: UNIT,
    paddingVertical: UNIT,
  },
  linkedIssuesTitle: {
    flex: 0.95,
  },
  linkedIssuesTitleSeparator: {
    height: 0.75,
    marginRight: -UNIT * 2,
    marginTop: UNIT,
    marginBottom: UNIT,
    backgroundColor: '$separator',
  },
  linkedIssuesTitleText: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
    marginBottom: UNIT / 2,
  },
  linkedIssuesTitleTextDetails: {
    color: '$text',
    fontSize: markdownText.fontSize,
  },
  linkedIssuesTitleIcon: {
    color: '$icon',
  },
});
