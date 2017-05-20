import {StyleSheet} from 'react-native';
import { UNIT, COLOR_LIGHT_GRAY, COLOR_FONT, AGILE_COLLAPSED_COLUMN_WIDTH, COLOR_GRAY, COLOR_FONT_GRAY, COLOR_PINK } from '../variables/variables';

export default StyleSheet.create({
  rowContainer: {},
  rowHeader: {
    padding: UNIT
  },
  headerIssueId: {
    marginLeft: UNIT * 2,
    marginBottom: UNIT/2,
    color: COLOR_PINK
  },
  resolvedIssueText: {
    color: COLOR_FONT_GRAY,
    textDecorationLine: 'line-through'
  },
  rowHeaderText: {
    color: COLOR_FONT,
    fontSize: 17,
    marginLeft: UNIT / 2,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  column: {
    flex: 1,

    borderRightWidth: 0.5,
    borderColor: COLOR_GRAY
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
  collapseIcon: {
    width: 12,
    height: 12,
    marginTop: UNIT/2,
    resizeMode: 'contain'
  },
  issueSquare: {
    width: UNIT,
    height: UNIT,
    margin: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  addCardButton: {
    margin: UNIT,
    padding: UNIT/2,
    borderRadius: UNIT/2,
    alignItems: 'center',
    backgroundColor: COLOR_LIGHT_GRAY
  },
  addCardIcon: {
    height: UNIT * 2.5,
    width: UNIT * 2.5,
    resizeMode: 'contain'
  }
});
