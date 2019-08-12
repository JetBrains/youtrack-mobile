import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY,
  COLOR_TRANSPARENT_BLACK,
  COLOR_SELECTED_DARK,
  COLOR_GRAY,
  COLOR_PINK
} from '../../components/variables/variables';

const SUGGESTION_BOTTOM = 48;

export default StyleSheet.create({

  commentsListContainer: {
    paddingBottom: UNIT * 3,
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY
  },
  commentInputWrapper: {
    backgroundColor: COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editingCommentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR_BLACK,
    padding: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingBottom: 0
  },
  editingCommentTitle: {
    color: COLOR_PINK
  },
  editingCommentText: {
    color: COLOR_FONT_GRAY,
    paddingRight: UNIT
  },
  editingCommentCloseIcon: {
    height: UNIT * 2.5,
    width: UNIT * 2.5,
    resizeMode: 'contain'
  },
  commentSuggestionsContainer: {
    backgroundColor: COLOR_TRANSPARENT_BLACK,
    position: 'absolute',
    top: -140,
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
    color: COLOR_FONT_ON_BLACK
  },
  commentSuggestionButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: UNIT / 2,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2
  },
  commentSuggestionName: {
    marginLeft: UNIT,
    color: COLOR_FONT_ON_BLACK
  },
  commentSuggestionLogin: {
    color: COLOR_FONT_GRAY
  },
  commentInput: {
    flex: 1,
    minHeight: UNIT * 4,
    borderRadius: 6,
    backgroundColor: COLOR_SELECTED_DARK,
    margin: UNIT,
    paddingLeft: UNIT,
    color: COLOR_FONT_ON_BLACK,
    fontSize: 15
  },
  commentSendButton: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  sendComment: {
    fontSize: 16,
    color: COLOR_PINK
  },
  sendCommentDisabled: {
    color: COLOR_FONT_GRAY
  },
  commentsContainer: {
    borderTopWidth: 1,
    borderColor: COLOR_GRAY,
    paddingTop: UNIT
  },
  addCommentContainer: {
    position: 'absolute',
    right: UNIT,
    bottom: UNIT
  },
  addCommentButton: {
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
  addCommentIcon: {
    marginTop: 4,
    width: UNIT * 3.5,
    height: UNIT * 3.5
  },
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
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
