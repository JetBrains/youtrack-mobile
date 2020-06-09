import {StyleSheet, Platform} from 'react-native';

import {
  UNIT,
  COLOR_FONT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_PINK,
  COLOR_DARK
} from '../../components/variables/variables';
import {SIZE as COLOR_FIELD_SIZE} from '../../components/color-field/color-field';
import {secondaryText, issueCard} from '../../components/common-styles/issue';
import {elevation1} from '../../components/common-styles/form';
import {separator} from '../../components/common-styles/list';

const rowLine = {
  flexDirection: 'row',
  alignItems: 'center'
};

const searchPanelHeight = UNIT * 12;
const searchContextHeight = UNIT * 7;

export default StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  list: {
    flexGrow: 0,
    paddingBottom: UNIT * 4
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2
  },
  tryAgainText: {
    fontSize: 18,
    color: COLOR_PINK
  },
  headerText: {
    color: COLOR_FONT_ON_BLACK,
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
  separator: separator,
  secondaryText: {
    ...secondaryText
  },
  headLeft: {
    ...issueCard.issueId
  },
  headRight: {
    ...rowLine,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  summary: {
    ...issueCard.issueSummary
  },
  subtext: {
    paddingTop: 6,
    fontSize: 14,
    color: COLOR_FONT_GRAY
  },
  listFooterMessage: {
    textAlign: 'center',
    padding: UNIT * 2
  },
  tags: {
    marginTop: UNIT
  },
  searchContext: {
    height: searchContextHeight,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  searchContextPinned: {
    ...elevation1
  },
  searchContextButton: {
    marginTop: UNIT,
    marginRight: UNIT * 2,
    marginLeft: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  contextButtonText: {
    fontSize: 20,
    letterSpacing: 0.13,
    fontWeight: '500',
    color: COLOR_DARK
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
