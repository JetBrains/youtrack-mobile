import {StyleSheet, Platform} from 'react-native';
import {keyboardSpacerTop} from '../platform/keyboard-spacer.ios';
import {
  UNIT,
  COLOR_PINK,
  COLOR_TRANSPARENT_BLACK,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_SELECTED_DARK
} from '../../components/variables/variables';

const QUERY_ASSIST_HEIGHT = UNIT * 6;

export default StyleSheet.create({
  placeHolder: {
    height: QUERY_ASSIST_HEIGHT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    marginTop: UNIT * 2,
    marginBottom: UNIT * 3
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: UNIT
  },
  inputWrapperActive: {
    backgroundColor: COLOR_BLACK,
    paddingLeft: UNIT * 2
  },
  searchInput: {
    flex: 1,
    height: QUERY_ASSIST_HEIGHT,
    paddingLeft: UNIT * 2,
    fontSize: 16,
    letterSpacing: 0.08,
    textAlign: 'left',
    color: '#717171'
  },
  icon: {
    lineHeight: 48,
    marginLeft: UNIT * 2,
    color: '#717171'
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
