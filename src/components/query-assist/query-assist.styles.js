import {StyleSheet} from 'react-native';

import {UNIT, COLOR_PINK, COLOR_LIGHT_GRAY, COLOR_FONT, COLOR_GRAY} from '../../components/variables/variables';
const QUERY_ASSIST_HEIGHT = 44;

export default StyleSheet.create({
  inputWrapper: {
    backgroundColor: COLOR_LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  searchInput: {
    flex: 1,
    height: UNIT * 3.5,
    borderRadius: 6,
    backgroundColor: '#FFF',
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_PINK,
    fontSize: 15
  },
  searchInputActive: {
    color: COLOR_FONT
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
    backgroundColor: '#FFFE'
  },
  keyboardSpacerHiddenContaioner: {
    position: 'absolute',
    height: 0,
    width: 0,
    opacity: 0
  }
});
