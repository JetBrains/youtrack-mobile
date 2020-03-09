/* @flow */

import {StyleSheet} from 'react-native';

import {
  UNIT,
  COLOR_FONT_GRAY,
  COLOR_LIGHT_GRAY,
  COLOR_ICON_LIGHT_BLUE
} from '../variables/variables';
import {issueCard} from '../common-styles/issue';

export const AGILE_CARD_HEIGHT = 131;

export default StyleSheet.create({
  card: {
    flexDirection: 'column',
    padding: UNIT,
    marginBottom: UNIT,
    marginRight: UNIT * 2,
    height: AGILE_CARD_HEIGHT,
    backgroundColor: COLOR_LIGHT_GRAY,
    borderRadius: UNIT * 0.75
  },
  ghost: {
    display: 'none'
  },
  dragging: {
    width: '50%',
    borderColor: COLOR_ICON_LIGHT_BLUE
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  estimation: {
    flexShrink: 1,
    marginLeft: UNIT * 2,
    fontSize: 11,
    color: COLOR_FONT_GRAY
  },
  summary: {
    ...issueCard.issueSummary,
  },
  colorFieldContainer: {
    ...issueCard.issueId,
    flexDirection: 'row'
  },
  issueIdColorField: {
    paddingLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    width: null, //Removes fixed width of usual color field
  },
  assignees: {
    flexDirection: 'row'
  },
  assignee: {
    marginLeft: UNIT / 2
  },
  tags: {
    marginTop: UNIT
  },
});
