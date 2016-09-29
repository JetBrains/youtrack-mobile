import {StyleSheet, Platform} from 'react-native';

import {UNIT, COLOR_FONT_GRAY, COLOR_FONT, COLOR_GRAY} from '../../components/variables/variables';
import {SIZE as COLOR_FIELD_SIZE} from '../../components/color-field/color-field';

module.exports = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  headerText: {
    fontSize: 17
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 10,
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
  arrowImage: {
    marginTop: 4,
    height: 14,
    resizeMode: 'contain'
  },
  separator: {
    height: 0.5,
    marginLeft: 40,
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
  loadingMore: {
    textAlign: 'center',
    padding: UNIT * 2
  }
});
