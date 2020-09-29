import EStyleSheet from 'react-native-extended-stylesheet';

import {Platform} from 'react-native';
import {UNIT} from '../../components/variables/variables';
import {SIZE as COLOR_FIELD_SIZE} from '../../components/color-field/color-field';
import {headerTitle, secondaryText} from '../../components/common-styles/typography';
import {issueCard} from '../../components/common-styles/issue';
import {elevation1} from '../../components/common-styles/shadow';
import {separator} from '../../components/common-styles/list';

const rowLine = {
  flexDirection: 'row',
  alignItems: 'center'
};

const searchPanelHeight = UNIT * 12;
const searchContextHeight = UNIT * 7;

export default EStyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '$background'
  },
  list: {
    flexGrow: 0,
    minHeight: 160,
    paddingBottom: UNIT * 4
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2
  },
  tryAgainText: {
    fontSize: 18,
    color: '$link'
  },
  headerText: {
    color: '$text',
    fontSize: 17
  },
  row: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingTop: 13,
    paddingBottom: UNIT * 1.5
  },
  priorityPlaceholder: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE
  },
  priorityWrapper: {
    marginRight: UNIT,
    ...Platform.select({
      android: {
        marginTop: UNIT / 4
      }
    })
  },
  rowLine: rowLine,
  separator: {
    ...separator,
    borderColor: '$separator'
  },
  secondaryText: {
    ...secondaryText,
    color: '$icon'
  },
  headLeft: {
    ...issueCard.issueId,
    color: '$icon'
  },
  headRight: {
    ...rowLine,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  summary: {
    ...issueCard.issueSummary,
    color: '$text'
  },
  subtext: {
    paddingTop: 6,
    fontSize: 14,
    color: '$textSecondary'
  },
  tags: {
    marginTop: UNIT
  },
  listHeader: {
    minHeight: 105
  },
  searchContext: {
    height: searchContextHeight,
    backgroundColor: '$background'
  },
  searchContextPinned: {
    ...elevation1
  },
  searchContextButton: {
    ...rowLine,
    marginTop: UNIT,
    marginRight: UNIT * 10,
    marginLeft: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  contextButtonText: {
    ...headerTitle,
    color: '$text',
    backgroundColor: '$background'
  },
  searchPanel: {
    zIndex: -1,
    marginBottom: UNIT * 2,
    height: searchPanelHeight
  },
  createIssueButton: {
    position: 'absolute',
    top: UNIT,
    right: 0,
    height: UNIT * 5,
    width: UNIT * 6,
    padding: UNIT
  }
});
