import {StyleSheet} from 'react-native';
import {keyboardSpacerTop} from '../platform/keyboard-spacer.ios';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_LIGHT_GRAY,
} from '../../components/variables/variables';
import {elevation1} from '../common-styles/form';

const QUERY_ASSIST_HEIGHT = UNIT * 6;

export default StyleSheet.create({
  placeHolder: {
    height: QUERY_ASSIST_HEIGHT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    marginTop: UNIT,
    marginBottom: UNIT * 2
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  listContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    padding: UNIT,
    paddingBottom: keyboardSpacerTop,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: UNIT,
    paddingRight: UNIT,
    borderRadius: UNIT,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  inputWrapperActive: {
    ...elevation1,
    backgroundColor: COLOR_FONT_ON_BLACK,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    borderRadius: 0,
    borderBottomColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    height: QUERY_ASSIST_HEIGHT,
    paddingLeft: UNIT,
    marginLeft: UNIT,
    marginRight: UNIT,

    fontSize: 16,
    letterSpacing: 0.08,
    textAlign: 'left',
    color: COLOR_BLACK
  },
  iconMagnify: {
    marginLeft: UNIT,
  }
});
