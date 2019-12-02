import {StyleSheet, Platform} from 'react-native';

import {UNIT, COLOR_FONT_GRAY, COLOR_FONT_ON_BLACK, COLOR_FONT, COLOR_PINK, COLOR_GRAY} from '../../components/variables/variables';
import {SIZE as COLOR_FIELD_SIZE} from '../../components/color-field/color-field';

export default StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT*2
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
    paddingTop: 13,
    paddingBottom: UNIT*2
  },
  rowText: {
    marginLeft: 10,
    flex: 1
  },
  priorityPlaceholder: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE
  },
  priorityWrapper: {
    ...Platform.select({
      android: {
        marginTop: UNIT/4
      }
    })
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  separator: {
    height: 0.5,
    marginLeft: UNIT * 2,
    backgroundColor: COLOR_GRAY
  },
  summary: {
    color: COLOR_FONT,
    flex: 1,
    fontSize: 17,
    lineHeight: 20
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
