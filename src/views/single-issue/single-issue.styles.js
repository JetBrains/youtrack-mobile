import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_TRANSPARENT_BLACK,
  COLOR_SELECTED_DARK,
  COLOR_GRAY,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_LINK
} from '../../components/variables/variables';

const SUGGESTION_BOTTOM = 48;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY
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
  summary: {
    paddingTop: UNIT,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLOR_FONT
  },
  description: {},
  attachments: {
    marginTop: UNIT * 2,
  },
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
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2,
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
  },

  row: {
    flexDirection: 'row',
    flex: 1
  },
  alignedRight: {
    marginRight: UNIT
  },

  activity: {
    flexDirection: 'row',
    paddingTop: UNIT * 4,
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },
  mergedActivity: {
    marginBottom: 0,
    marginLeft: UNIT * 5,
    paddingTop: UNIT * 2
  },
  activityAuthor: {
    flexDirection: 'row'
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT,
  },
  activityAuthorName: {
    flex: 0,
    marginRight: UNIT / 2,
    color: COLOR_FONT,
    fontWeight: 'bold'
  },
  activityTimestamp: {
    color: COLOR_FONT,
  },
  activityLabel: {
    flex: 1,
    color: '#737577'
  },
  activityRelatedChanges: {
    flex: 1,
    paddingTop: UNIT,
    paddingRight: UNIT,
    paddingBottom: UNIT * 2,
    marginTop: UNIT * 2,
    marginRight: -1 * UNIT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLOR_MEDIUM_GRAY,
    lineHeight: 14
  },
  activityHistoryChanges: {
    flex: 1,
    lineHeight: 14,
  },
  activityChange: {
    marginTop: UNIT / 2,
  },
  activityRemoved: {
    textDecorationLine: 'line-through'
  },
  activityHistoryIcon: {
    width: 20,
    height: 20,
    marginTop: -1,
    marginLeft: 10,
    marginRight: 10,
    resizeMode: 'contain',
    opacity: 0.3
  },

  linkedIssue: {
    flexDirection: 'row',
  },
  linkText: {
    color: COLOR_LINK
  },

  settingsModal: {
    justifyContent: 'flex-end'
  },
  settingsPanel: {
    flex: 0,
    backgroundColor: COLOR_BLACK
  },
  settingsApplyButton: {
    backgroundColor: COLOR_PINK,
    padding: UNIT,
    paddingLeft: UNIT * 2
  },
  settingsApplyButtonText: {
    height: 24,
    fontSize: 20,
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'center'
  },
  settingsSelect: {
    flex: 0,
    paddingBottom: UNIT * 2,
  },
  settingsToggle: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    marginBottom: UNIT * 4
  },
  settingsToggleText: {
    color: COLOR_PINK,
    textAlign: 'center'
  },

  workTime: {
    fontWeight: 'bold'
  }
});
