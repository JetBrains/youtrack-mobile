import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_TRANSPARENT_BLACK, COLOR_FONT_ON_BLACK, COLOR_BLACK, COLOR_SELECTED_DARK} from '../../components/variables/variables';

const QUERY_ASSIST_HEIGHT = 52;

export default StyleSheet.create({
  placeHolder: {
    height: QUERY_ASSIST_HEIGHT
  },
  modal: {
    justifyContent: 'flex-end',
    left: 0,
    right: 0,
    bottom: 0
  },
  modalFullScreen: {
    top: 0
  },
  listContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
  },
  inputWrapper: {
    backgroundColor: COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    flex: 1,
    height: UNIT * 4.5,
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
  clearIconWrapper: {
    backgroundColor: 'transparent',
    marginLeft: -28,
    marginRight: 12,
    overflow: 'visible'
  },
  clearIcon: {
    width: UNIT * 2,
    height: UNIT * 2
  },
  cancelSearch: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelText: {
    fontSize: 16,
    color: COLOR_PINK
  }
});
