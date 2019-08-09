import {StyleSheet, Platform} from 'react-native';
import {keyboardSpacerTop} from '../platform/keyboard-spacer.ios';
import {
  UNIT,
  COLOR_PINK,
  COLOR_TRANSPARENT_BLACK,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_SELECTED_DARK,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_MEDIUM_GRAY, COLOR_FONT
} from '../../components/variables/variables';

const QUERY_ASSIST_HEIGHT = 52;
const inputBorderWidth = 1;

export default StyleSheet.create({
  placeHolder: {
    height: QUERY_ASSIST_HEIGHT,
    backgroundColor: COLOR_BLACK
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  listContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    paddingBottom: keyboardSpacerTop,
    justifyContent: 'flex-start',
    backgroundColor: COLOR_TRANSPARENT_BLACK,
  },
  inputWrapper: {
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: COLOR_MEDIUM_GRAY,
    paddingLeft: UNIT - inputBorderWidth * 2,
    paddingRight: UNIT - inputBorderWidth * 2
  },
  inputWrapperActive: {
    backgroundColor: COLOR_BLACK,
    borderBottomWidth: 0
  },
  searchInput: {
    flex: 1,
    height: UNIT * 4.5,
    borderRadius: 6,
    backgroundColor: COLOR_FONT_ON_BLACK,
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_FONT,
    fontSize: 15,
    borderWidth: inputBorderWidth,
    borderColor: COLOR_MEDIUM_GRAY,
    textAlign: 'left'
  },
  searchInputEmpty: {
    textAlign: 'center'
  },
  searchInputActive: {
    backgroundColor: COLOR_SELECTED_DARK,
    color: COLOR_FONT_ON_BLACK,
    borderWidth: 0,
    textAlign: 'left',

    ...Platform.select({
      android: {
        paddingRight: UNIT * 4
      }
    })
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
