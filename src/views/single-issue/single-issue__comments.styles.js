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
  COLOR_BLACK
} from '../../components/variables/variables';
import {mainText, secondaryText} from '../../components/common-styles/issue';

const SUGGESTION_BOTTOM = 58;
const INPUT_BORDER_RADIUS = UNIT;
const MIN_INPUT_SIZE = UNIT * 4;

export default StyleSheet.create({
  commentContainer: {
    backgroundColor: COLOR_FONT_ON_BLACK,
    elevation: 5,
    shadowColor: COLOR_BLACK,
    shadowOpacity: 0.2,
    shadowRadius: 0.5,
    shadowOffset: {
      height: -0.5,
      width: 0
    }
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
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2,
    marginBottom: UNIT,
    padding: 2,
    borderRadius: INPUT_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLOR_MEDIUM_GRAY,
  },
  commentInput: {
    flex: 1,
    minHeight: MIN_INPUT_SIZE,
    padding: 0,
    paddingLeft: UNIT,
    marginRight: UNIT,
    backgroundColor: COLOR_FONT_ON_BLACK,
    ...mainText,
    color: COLOR_BLACK
  },
  commentSendButton: {
    width: MIN_INPUT_SIZE,
    height: MIN_INPUT_SIZE,
    borderRadius: INPUT_BORDER_RADIUS - 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_PINK
  },
  commentSendButtonText: {
    fontSize: 16,
    color: COLOR_PINK
  },
  commentSendButtonTextDisabled: {
    backgroundColor: COLOR_FONT_GRAY
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: UNIT * 2
  },
  visibilityChangeButtonLockIcon: {
    marginRight: UNIT
  },
  visibilityChangeButtonText: {
    ...secondaryText,
    marginRight: UNIT
  }
});
