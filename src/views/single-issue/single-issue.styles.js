import {StyleSheet} from 'react-native';
import {UNIT, FOOTER_HEIGHT, COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  headerText: {
    flex: 1,
    textAlign: 'center'
  },
  issueViewContainer: {
    padding: UNIT * 2,
    backgroundColor: '#FFF'
  },
  authorForText: {
    color: '#666'
  },
  summary: {
    paddingTop: UNIT * 2,
    fontSize: 18,
    fontWeight: 'bold'
  },
  summaryInput: {
    color: COLOR_FONT,
    fontSize: 18,
    marginBottom: UNIT
  },
  description: {
    paddingTop: UNIT * 2
  },
  descriptionInput: {
    color: COLOR_FONT,
    marginBottom: UNIT
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
    height: UNIT * 4,
    borderRadius: 6,
    backgroundColor: '#FFF',
    color: COLOR_FONT,
    margin: UNIT,
    padding: 6,
    paddingTop: 2
  },
  commentSendButton: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  commentsContainer: {
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
  footer: {
    paddingLeft: UNIT,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: FOOTER_HEIGHT
  },
  footerIcon: {
    width: UNIT * 3,
    height: UNIT * 3
  },
  iconButton: {
    justifyContent: 'center',
    padding: UNIT
  },
  separator: {
    height: 0.5,
    marginLeft: - UNIT*2,
    marginRight: - UNIT*2,
    backgroundColor: '#C8C7CC'
  }
});
