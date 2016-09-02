import {StyleSheet, Platform} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_FONT, COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';
const ATTACHING_IMAGE_ALPHA = '70';

const SUGGESTION_BOTTOM = Platform.OS === 'ios' ? 52 : 48;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  headerText: {
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
  authorForText: {
    paddingTop: 2,
    fontSize: 14,
    color: COLOR_FONT_GRAY
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
  summaryInput: {
    marginTop: UNIT,
    marginBottom: UNIT,
    color: COLOR_FONT,
    fontSize: 18,
    height: UNIT * 5
  },
  descriptionInput: {
    marginTop: UNIT,
    marginBottom: UNIT,
    height: UNIT * 10,
    color: COLOR_FONT,
    fontSize: 14,
    textAlignVertical: 'top'
  },
  attachesContainer: {
    marginTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    marginBottom: 2,
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2
  },
  attachmentImage: {
    marginRight: UNIT,
    width: 120,
    height: UNIT * 8,
    borderRadius: 4,
    resizeMode: 'cover'
  },
  attachmentFile: {
    marginRight: UNIT * 2,
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageActivityIndicator: {
    backgroundColor: `#CCCCCC${ATTACHING_IMAGE_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT*2,
    bottom: 0
  },
  commentsListContainer: {
    paddingBottom: UNIT * 6
  },
  commentInputWrapper: {
    backgroundColor: '#EBEBEB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentSuggestionsContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 0.5,
    borderColor: COLOR_GRAY,
    position: 'absolute',
    top: -140,
    bottom: SUGGESTION_BOTTOM,
    left: 0,
    right: 0,
    flex: 1,
    paddingTop: UNIT/2
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
    color: COLOR_FONT
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
    height: UNIT * 3.5,
    borderRadius: 6,
    backgroundColor: '#FFF',
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_FONT,
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
    borderTopWidth: 0.5,
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
    opacity: 0.7,
    position: 'absolute',

    right: UNIT,
    bottom: UNIT * 8
  },
  addCommentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',
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
    opacity: 0.8,
    marginTop: 4,
    width: UNIT * 3.5,
    height: UNIT * 3.5
  }
});
