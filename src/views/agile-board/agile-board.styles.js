import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_PINK,
  COLOR_FONT,
  COLOR_FONT_ON_BLACK,
  COLOR_TRANSPARENT_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY
} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerBoardButton: {
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'center'
  },
  headerBoardNotCollapsibleButton: {
    marginLeft: UNIT * 2.5
  },
  headerText: {
    fontSize: 17,
    color: COLOR_FONT_ON_BLACK
  },
  headerTextDisabled: {
    color: COLOR_FONT_GRAY
  },
  headerSelectIcon: {
    width: 9,
    marginLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    alignSelf: 'center',
    resizeMode: 'contain',
    tintColor: COLOR_FONT_ON_BLACK
  },
  boardHeaderContainer: {
    overflow: 'hidden',
    backgroundColor: COLOR_BLACK
  },
  loadingMoreIndicator: {
    padding: UNIT * 2
  },
  zoomButtonContainer: {
    position: 'absolute',
    right: UNIT * 2,
    bottom: UNIT * 2
  },
  zoomButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFFAA',
    borderRadius: UNIT * 4,

    width: UNIT * 8,
    height: UNIT * 8,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      height: 2,
      width: 0
    }
  },
  zoomButtonIcon: {
    marginTop: 4,
    resizeMode: 'contain',
    width: UNIT * 3.5,
    height: UNIT * 3.5
  },
  agileBoardMessage: {
    flex: 1,
    alignItems: 'center'
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
  selectModal: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  }
});
