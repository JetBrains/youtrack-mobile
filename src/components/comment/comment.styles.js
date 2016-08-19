import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },

  authorName: {
    color: COLOR_FONT,
    fontWeight: 'bold'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  comment: {
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
