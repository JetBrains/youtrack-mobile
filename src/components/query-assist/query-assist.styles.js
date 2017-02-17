import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_TRANSPARENT_BLACK, COLOR_FONT_ON_BLACK, COLOR_BLACK, COLOR_SELECTED_DARK} from '../../components/variables/variables';

const QUERY_ASSIST_HEIGHT = 44;

export default StyleSheet.create({
  inputWrapper: {
    backgroundColor: COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    flex: 1,
    height: UNIT * 3.5,
    borderRadius: 6,
    backgroundColor: COLOR_SELECTED_DARK,
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_PINK,
    fontSize: 15
  },
  searchInputActive: {
    color: COLOR_FONT_ON_BLACK
  },
  cancelSearch: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelText: {
    fontSize: 16,
    color: COLOR_PINK
  },
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: QUERY_ASSIST_HEIGHT,
    top: -1000,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  keyboardSpacerHiddenContaioner: {
    position: 'absolute',
    height: 0,
    width: 0,
    opacity: 0
  }
});
