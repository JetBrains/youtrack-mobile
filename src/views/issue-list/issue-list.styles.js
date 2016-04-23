import {StyleSheet, Platform} from 'react-native';

import {UNIT, COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';

module.exports = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#FFF'
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
    backgroundColor: '#C8C7CC'
  },
  summary: {
    flexWrap: 'nowrap'
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
