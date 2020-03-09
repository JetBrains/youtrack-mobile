import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_LIGHT_GRAY,
  COLOR_FONT,
  AGILE_COLLAPSED_COLUMN_WIDTH,
  COLOR_GRAY,
  COLOR_FONT_GRAY,
} from '../variables/variables';
import {issueCard, issueResolved, issueIdResolved} from '../common-styles/issue';

export default StyleSheet.create({
  issueResolved: issueResolved,
  issueIdResolved: issueIdResolved,

  rowContainer: {},
  rowHeader: {
    paddingTop: UNIT * 2,
    paddingRight: UNIT,
    paddingBottom: UNIT * 2,
    paddingLeft: UNIT,
  },
  headerIssueId: {
    ...issueCard.issueId,
    marginLeft: UNIT * 3,
    marginBottom: UNIT / 2
  },
  resolvedIssueText: {
    color: COLOR_FONT_GRAY,
    textDecorationLine: 'line-through'
  },
  rowHeaderText: {
    color: COLOR_FONT,
    fontSize: 20,
    marginLeft: UNIT,
    fontWeight: '500',
    letterSpacing: 0.13,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  column: {
    flex: 1
  },
  columnWithoutBorder: {
    borderRightWidth: 0
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
    borderColor: 'rgba(0,0,0,0.1)'
  },
  addCardButton: {
    marginBottom: UNIT * 2,
    marginRight: UNIT * 2,
    height: UNIT * 4,
    borderRadius: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_LIGHT_GRAY
  },
  addCardIcon: {
    height: UNIT * 2.5,
    width: UNIT * 2.5,
    resizeMode: 'contain'
  }
});
