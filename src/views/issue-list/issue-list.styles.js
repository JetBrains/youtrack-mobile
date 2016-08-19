import {StyleSheet} from 'react-native';

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
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  rowText: {
    marginLeft: UNIT * 2,
    flex: 1
  },
  priorityPlaceholder: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  arrowImage: {
    height: 14,
    resizeMode: 'contain'
  },
  separator: {
    height: 0.5,
    marginLeft: 52,
    backgroundColor: COLOR_GRAY
  },
  summary: {
    flexWrap: 'nowrap',
    color: COLOR_FONT
  },
  subtext: {
    paddingTop: UNIT,
    fontSize: 12,
    color: COLOR_FONT_GRAY
  },
  loadingMore: {
    textAlign: 'center',
    padding: UNIT * 2
  }
});
