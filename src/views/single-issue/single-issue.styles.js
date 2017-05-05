import {StyleSheet, Platform} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT_ON_BLACK, COLOR_BLACK, COLOR_FONT_GRAY, COLOR_FONT, COLOR_TRANSPARENT_BLACK, COLOR_SELECTED_DARK, COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';

const SUGGESTION_BOTTOM = Platform.OS === 'ios' ? 52 : 48;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  headerText: {
    color: COLOR_FONT_ON_BLACK,
    fontSize: 17
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  issueViewContainer: {
    padding: UNIT * 2,
    paddingTop: UNIT,
    backgroundColor: '#FFF'
  },
  issueTopMessage: {
    paddingTop: 2
  },
  issueTopText: {
    fontSize: 14,
    color: COLOR_FONT_GRAY,
  },
  showMoreDateButton: {
    fontSize: 14,
    color: COLOR_FONT_GRAY
  },
  updatedInformation: {
    marginTop: UNIT
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginLeft: -UNIT/4,
    marginRight: -UNIT/4
  },
  tagColorField: {
    width: null, //Removes fixed width of usual color field
    paddingLeft: UNIT/2,
    paddingRight: UNIT/2,
    margin: UNIT/4,
    borderWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  tagButton: {
  },
  summary: {
    paddingTop: UNIT,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLOR_FONT
  },
  description: {
  },
  commentsListContainer: {
    paddingBottom: UNIT * 6
  },
  commentInputWrapper: {
    backgroundColor: COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentSuggestionsContainer: {
    backgroundColor: COLOR_TRANSPARENT_BLACK,
    position: 'absolute',
    top: -140,
    bottom: SUGGESTION_BOTTOM,
    left: 0,
    right: 0,
    flex: 1,
    paddingTop: UNIT/2
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
    padding: UNIT/2,
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
  commentSuggestionAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    borderRadius: UNIT * 2
  },
  loading: {
    textAlign: 'center',
    marginTop: UNIT * 2,
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
  separator: {
    height: 0.5,
    marginLeft: - UNIT*2,
    marginRight: - UNIT*2,
    backgroundColor: COLOR_GRAY
  },
  disabledSaveButton: {
    color: COLOR_FONT_GRAY
  },
  addCommentContainer: {
    position: 'absolute',

    right: UNIT,
    bottom: UNIT * 8
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
  }
});
