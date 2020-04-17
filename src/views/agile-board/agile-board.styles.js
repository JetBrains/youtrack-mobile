import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_PINK,
  COLOR_FONT,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/issue';
import {link} from '../../components/common-styles/button';

export default StyleSheet.create({
  agile: {
    flex: 1,
    padding: UNIT * 2,
    paddingRight: 0,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  headerIconDisabled: {
    tintColor: COLOR_FONT_GRAY
  },
  boardHeaderContainer: {
    overflow: 'hidden',
    backgroundColor: COLOR_FONT_ON_BLACK
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
    justifyContent: 'space-between',
    marginTop: UNIT * 2
  },
  popupButtonText: {
    ...mainText,
    ...link
  },
  card: {
    marginBottom: UNIT * 2
  }
});
