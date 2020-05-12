import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_PINK,
  COLOR_FONT,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
  COLOR_BLACK
} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/issue';
import {link} from '../../components/common-styles/button';

export default StyleSheet.create({
  agile: {
    flex: 1,
    padding: UNIT * 2,
    paddingBottom: 0,
    paddingRight: 0,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  title: {
    fontSize: 17,
    color: COLOR_BLACK
  },
  headerIconDisabled: {
    tintColor: COLOR_FONT_GRAY
  },
  boardHeaderContainer: {
    overflow: 'hidden',
    backgroundColor: COLOR_FONT_ON_BLACK,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  loadingIndicator: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingMoreIndicator: {
    padding: UNIT * 2
  },
  zoomButton: {
    position: 'absolute',
    zIndex: 1,
    top: UNIT * 2,
    right: UNIT * 2
  },
  zoomButtonIcon: {
    resizeMode: 'contain',
    width: UNIT * 2,
    height: UNIT * 2
  },
  agileBoardSmile: {
    paddingTop: UNIT * 6,
    fontSize: 36,
    color: COLOR_FONT
  },
  agileBoardMessageText: {
    paddingTop: UNIT,
    fontSize: 18,
    color: COLOR_FONT
  },
  selectBoardMessage: {
    paddingTop: UNIT * 2,
    fontSize: 18,
    color: COLOR_PINK
  },
  popupModal: {
    justifyContent: 'flex-end'
  },
  popupPanel: {
    padding: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK,
    borderTopWidth: 1,
    borderColor: COLOR_GRAY
  },
  popupText: {
    fontSize: 18,
  },
  popupButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  popupButton: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UNIT * 4,
    backgroundColor: COLOR_PINK,
    borderRadius: UNIT / 2,
    marginLeft: UNIT * 2
  },
  popupButtonText: {
    fontSize: 20,
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'center',
    ...mainText,
    ...link
  },
  card: {
    marginBottom: UNIT * 2
  },
  agileSelector: {
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  agileSelectorText: {
    fontSize: 20
  }
});
