import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_TRANSPARENT_BLACK,
  COLOR_GRAY,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_FONT,
  COLOR_ICON_MEDIUM_GREY
} from '../../components/variables/variables';

const SUGGESTION_BOTTOM = 58;

export default StyleSheet.create({
  commentContainer: {
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY,
    borderTopWidth: 1,
    borderColor: COLOR_MEDIUM_GRAY
  },

  commentEditContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 3,
    paddingLeft: UNIT * 3,
    paddingRight: UNIT * 4
  },
  commentEditTitle: {
    color: COLOR_PINK
  },
  commentEditText: {
    color: COLOR_FONT,
    paddingRight: UNIT
  },
  commentEditCloseIcon: {
    height: UNIT * 2.5,
    width: UNIT * 2.5,
    resizeMode: 'contain',
    tintColor: COLOR_ICON_MEDIUM_GREY
  },
  suggestionsContainer: {
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY,
    position: 'absolute',
    top: -176,
    bottom: SUGGESTION_BOTTOM,
    left: 0,
    right: 0,
    flex: 1,
    paddingTop: UNIT / 2
  },
  suggestionsLoadingMessage: {
    alignItems: 'center',
    margin: UNIT
  },
  suggestionsLoadingMessageText: {
    color: COLOR_FONT
  },
  suggestionButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: UNIT / 2,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2
  },
  suggestionName: {
    marginLeft: UNIT,
    color: COLOR_FONT
  },
  suggestionLogin: {
    fontSize: 11,
    color: COLOR_FONT_GRAY
  },

  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: UNIT * 2
  },
  commentInput: {
    flex: 1,
    minHeight: UNIT * 4,
    paddingLeft: UNIT,
    borderRadius: 5,
    backgroundColor: COLOR_FONT_ON_BLACK,
    borderWidth: 1,
    borderColor: COLOR_MEDIUM_GRAY,
    color: COLOR_FONT,
    fontSize: 15
  },
  commentSendButton: {
    alignItems: 'center',
    minWidth: UNIT * 8,
    padding: UNIT,
    paddingRight: UNIT * 2
  },
  commentSendButtonText: {
    fontSize: 16,
    color: COLOR_PINK
  },
  commentSendButtonTextDisabled: {
    color: COLOR_FONT_GRAY
  },

  commentListContainer: {
    borderTopWidth: 1,
    borderColor: COLOR_GRAY,
    paddingTop: UNIT
  },

  visibilitySelect: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  visibilityChangeButton: {
    padding: UNIT
  },
  visibilityChangeIcon: {
    resizeMode: 'contain',
    width: 28
  }
});
