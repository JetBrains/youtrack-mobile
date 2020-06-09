import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_FONT,
  COLOR_BLACK, COLOR_LIGHT_GRAY
} from '../../components/variables/variables';
import {mainText, secondaryText} from '../../components/common-styles/typography';

const INPUT_BORDER_RADIUS = UNIT;
const MIN_INPUT_SIZE = UNIT * 4;

export default StyleSheet.create({
  container: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    paddingLeft: UNIT * 3,
    paddingRight: UNIT * 3,
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
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  suggestionsLoadingMessage: {
    flexGrow: 1,
    alignItems: 'center',
  },
  suggestionsLoadingMessageText: {
    padding: UNIT,
    color: COLOR_FONT
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    borderBottomWidth: 1,
    borderColor: COLOR_LIGHT_GRAY
  },
  suggestionName: {
    flexGrow: 1,
    marginLeft: UNIT,
    color: COLOR_BLACK
  },
  suggestionLogin: {
    color: COLOR_FONT_GRAY
  },

  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 2,
    marginLeft: UNIT,
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

  visibilityChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: UNIT * 2,
    marginTop: UNIT
  },
  visibilityChangeButtonLockIcon: {
    marginRight: UNIT
  },
  visibilityChangeButtonText: {
    ...secondaryText,
    marginRight: UNIT
  }
});
