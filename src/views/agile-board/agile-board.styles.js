import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_PINK,
  COLOR_FONT,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
  COLOR_DARK
} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/issue';
import {link} from '../../components/common-styles/button';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  agileNavigation: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  agileNavigationButton: {
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'center',
    marginBottom: UNIT * 2
  },
  agileNavigationButtonText: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_DARK
  },
  agileNavigationButtonTextMain: {
    fontSize: 20
  },
  agileNavigationButtonTextDisabled: {
    color: COLOR_FONT_GRAY
  },
  agileNavigationButtonIcon: {
    lineHeight: 19
  },
  headerIconDisabled: {
    tintColor: COLOR_FONT_GRAY
  },
  boardHeaderContainer: {
    overflow: 'hidden',
    marginTop: UNIT
  },
  loadingIndicator: {
    flex: 1,
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
});
