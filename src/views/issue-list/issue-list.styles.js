import {StyleSheet, Platform} from 'react-native';

import {
  UNIT,
  COLOR_FONT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_ICON_MEDIUM_GREY
} from '../../components/variables/variables';
import {SIZE as COLOR_FIELD_SIZE} from '../../components/color-field/color-field';

const rowLine = {
  flexDirection: 'row',
  alignItems: 'center'
};

const secondaryText = {color: COLOR_ICON_MEDIUM_GREY};

export default StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: COLOR_FONT_ON_BLACK
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
    paddingRight: UNIT * 1.5,
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
    height: 0.5,
    marginLeft: UNIT * 2,
    backgroundColor: COLOR_MEDIUM_GRAY
  },
  secondaryText: {
    ...secondaryText
  },
  headLeft: {
    flexShrink: 0,
    flexGrow: 0,
    ...secondaryText
  },
  headRight: {
    ...rowLine,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  summary: {
    flex: 1,
    marginTop: UNIT,
    color: '#1f2326',
    fontSize: 16,
    lineHeight: 20,
  },
  subtext: {
    paddingTop: 6,
    fontSize: 14,
    color: COLOR_FONT_GRAY
  },
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 36,
    color: COLOR_FONT,
    textAlign: 'center'
  },
  listFooterMessage: {
    textAlign: 'center',
    padding: UNIT * 2
  },
  tags: {
    height: 22,
    overflow: 'hidden',
    marginTop: UNIT / 2
  }
});
