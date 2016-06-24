import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_FONT, COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  headerText: {
    flex: 1,
    textAlign: 'center'
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  issueViewContainer: {
    padding: UNIT * 2,
    backgroundColor: '#FFF'
  },
  authorForText: {
    marginTop: UNIT,
    color: '#666'
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
    margin: UNIT/4
  },
  summary: {
    paddingTop: UNIT * 2,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR_FONT
  },
  description: {
    paddingTop: UNIT * 2
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
    marginTop: UNIT * 2
  },
  attachment: {
    marginRight: UNIT * 2,
    width: 120,
    height: 60,
    borderRadius: 4,
    resizeMode: 'cover'
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
  loading: {
    textAlign: 'center',
    marginTop: UNIT * 2,
    color: COLOR_FONT_GRAY
  },
  commendInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
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
    padding: UNIT * 2
  },
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT * 2
  },
  avatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    borderRadius: UNIT * 2
  },
  comment: {
    marginTop: UNIT / 2,
    marginLeft: UNIT,
    flex: 1
  },
  commentText: {
    marginTop: UNIT
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

    right: UNIT * 2,
    bottom: UNIT * 9
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
