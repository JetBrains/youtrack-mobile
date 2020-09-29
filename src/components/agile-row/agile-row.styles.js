import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../agile-column/agile-column';
import {issueIdResolved} from '../common-styles/issue';
import {headerTitle, MAIN_FONT_SIZE, mainText} from '../common-styles/typography';

const ROW_TEXT_LINE_HEIGHT = 24;

export default EStyleSheet.create({
  issueResolved: {
    color: '$border'
  },
  issueIdResolved: issueIdResolved,

  rowContainer: {},
  rowHeader: {
    flexDirection: 'row',
    marginLeft: UNIT,
    paddingTop: UNIT * 2,
    paddingRight: UNIT,
    paddingBottom: UNIT * 2,
    paddingLeft: UNIT
  },
  rowHeaderZoomedOut: {
    flexWrap: 'wrap'
  },
  headerIssueId: {
    marginLeft: UNIT * 2,
    color: '$link',
    ...mainText,
    ...Platform.select({
      ios: {
        lineHeight: ROW_TEXT_LINE_HEIGHT + 2
      },
      android: {
        lineHeight: ROW_TEXT_LINE_HEIGHT
      }
    }),
  },
  headerIssueIdZoomedOut: {
    marginLeft: UNIT * 3,
    fontSize: MAIN_FONT_SIZE - 2,
  },
  resolvedIssueText: {
    color: '$textSecondary',
    textDecorationLine: 'line-through'
  },
  rowHeaderText: {
    ...headerTitle,
    color: '$text',
    lineHeight: ROW_TEXT_LINE_HEIGHT,
    marginLeft: UNIT,
    fontWeight: '500'
  },
  rowHeaderTextZoomedOut: {
    fontSize: MAIN_FONT_SIZE,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '$textSecondary'
  },
  column: {
    flex: 1
  },
  columnWithoutBorder: {
    borderRightWidth: 0
  },
  columnFirst: {
    marginLeft: UNIT
  },
  columnCollapsed: {
    flex: 0,
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    minWidth: AGILE_COLLAPSED_COLUMN_WIDTH,
    paddingTop: UNIT - 2,
    paddingLeft: 2,
    paddingRight: 2,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  columnCollapsedAll: {
    width: null,
    flex: 1
  },
  card: {
    marginBottom: UNIT * 2
  },
  collapseButton: {
    flexDirection: 'row',
  },
  collapseButtonIcon: {
    marginTop: UNIT / 4,
    width: UNIT * 2
  },
  issueSquare: {
    width: UNIT,
    height: UNIT,
    margin: 2,
    borderWidth: 1,
    borderColor: '$boxBackground'
  },
  addCardButton: {
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    height: UNIT * 4,
    borderRadius: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground'
  },
  addCardIcon: {
    height: UNIT * 2.5,
    width: UNIT * 2.5,
    resizeMode: 'contain'
  }
});
