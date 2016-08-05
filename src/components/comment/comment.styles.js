import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';

export default StyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2
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

  swipeButton: {
    paddingTop: UNIT * 2,
    flex: 1,
    alignItems: 'center'
  },
  swipeButtonIcon: {
    marginTop: 4,
    width: UNIT * 2,
    height: UNIT * 2
  },
  swipeButtonText: {
    color: '#FFF',
    paddingTop: UNIT,
    fontSize: 10,
    fontFamily: 'System'
  }
});
