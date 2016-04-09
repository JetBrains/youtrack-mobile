import {StyleSheet} from 'react-native';

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
  inputWrapper: {
    backgroundColor: COLOR_PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    flex: 1,
    height: UNIT * 4,
    borderRadius: 6,
    backgroundColor: '#FFF',
    margin: UNIT,
    padding: 6
  },
  cancelSearch: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelText: {
    fontSize: 16,
    color: '#FFF'
  },
  searchSuggestions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFFF4'
  },
  loadingMore: {
    textAlign: 'center',
    padding: UNIT * 2
  }
});
