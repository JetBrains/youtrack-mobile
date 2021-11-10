import EStyleSheet from 'react-native-extended-stylesheet';

import {Platform} from 'react-native';

import {COLOR_FIELD_SIZE} from '../../components/color-field/color-field';
import {elevation1} from '../../components/common-styles/shadow';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {headerTitlePresentation} from '../../components/header/header.styles';
import {ICON_NOT_FOUND_DEFAULT_SIZE} from '../../components/icon/icon-no-found';
import {issueCard} from '../../components/common-styles/issue';
import {separator} from '../../components/common-styles/list';
import {UNIT} from '../../components/variables/variables';

const rowLine = {
  flexDirection: 'row',
  alignItems: 'center',
};

const searchContextHeight = UNIT * 7;
export const noIssuesFoundIconSize = ICON_NOT_FOUND_DEFAULT_SIZE;

export default EStyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '$background',
  },
  list: {
    flexGrow: 0,
    minHeight: 160,
    paddingBottom: UNIT * 4,
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2,
  },
  tryAgainText: {
    fontSize: 18,
    color: '$link',
  },
  headerText: {
    color: '$text',
    fontSize: 17,
  },
  row: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingTop: 13,
    paddingBottom: UNIT * 1.5,
  },
  priorityPlaceholder: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE,
  },
  priorityWrapper: {
    marginRight: UNIT,
    ...Platform.select({
      android: {
        marginTop: UNIT / 4,
      },
    }),
  },
  rowLine: rowLine,
  separator: {
    ...separator,
    borderBottomWidth: 0.75,
    borderColor: '$separator',
  },
  secondaryText: {
    ...secondaryText,
    color: '$icon',
  },
  mainText: {
    ...mainText,
    color: '$text',
  },
  headLeft: {
    ...issueCard.issueId,
    color: '$icon',
  },
  headRight: {
    ...rowLine,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  summary: {
    ...issueCard.issueSummary,
    color: '$text',
  },
  subtext: {
    paddingTop: 6,
    fontSize: 14,
    color: '$textSecondary',
  },
  tags: {
    marginTop: UNIT,
  },
  listHeader: {
    minHeight: 105,
  },
  listHeaderTop: {
    flexDirection: 'row',
    marginTop: UNIT,
  },
  userSearchQueryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UNIT / 2,
    padding: UNIT / 2,
    paddingRight: UNIT,
    paddingLeft: 0,
  },
  searchContext: {
    height: searchContextHeight,
    backgroundColor: '$background',
  },
  searchContextPinned: {
    ...elevation1,
  },
  searchContextButton: {
    ...rowLine,
    marginTop: UNIT,
    marginRight: UNIT * 10,
    marginLeft: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT,
  },
  contextButtonText: {
    ...headerTitle,
    color: '$text',
    backgroundColor: '$background',
  },
  searchPanel: {
    flexGrow: 1,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
  },
  createIssueButton: {
    position: 'absolute',
    top: UNIT,
    right: UNIT / 2,
    height: UNIT * 5,
    width: UNIT * 5,
    padding: UNIT,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: UNIT * 2,
  },
  toolbarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: UNIT * 2,
  },
  toolbarActionSortBy: {
    marginRight: -UNIT / 4,
  },
  toolbarText: {
    flexBasis: '45%',
    ...secondaryText,
    color: '$icon',
  },
  toolbarSortByText: {
    textAlign: 'right',
  },
  noIssuesFoundIcon: {
    marginTop: -noIssuesFoundIconSize / 3,
    marginLeft: -UNIT * 4,
    marginBottom: -UNIT * 2,
  },
  resolved: {
    color: '$resolved',
  },
  headerTitle: {
    ...headerTitlePresentation,
    marginLeft: 0,
  },
  link: {
    color: '$link',
  },
  sortBy: {
    flex: 1,
    backgroundColor: '$background',
    paddingRight: UNIT,
  },
  sortByList: {
    flex: 1,
    paddingTop: UNIT,
    marginLeft: UNIT / 2,
  },
  sortByListAddIcon: {
    paddingRight: UNIT,
  },
  sortByListItem: {
    ...rowLine,
    justifyContent: 'space-between',
    paddingVertical: UNIT * 2,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT,
  },
  sortByListItemActive: {
    backgroundColor: '$boxBackground',
  },
  sortByListWarning: {
    color: '$icon',
    margin: UNIT * 2.5,
    marginBottom: UNIT,
  },
  sortByListItemText: {
    color: '$text',
    ...mainText,
    paddingLeft: UNIT * 2,
  },
  sortIcon: {
    color: '$iconAccent',
  },
  sortIconButton: {
    width: UNIT * 4.5,
    height: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: UNIT * 1.5,
  },
});
