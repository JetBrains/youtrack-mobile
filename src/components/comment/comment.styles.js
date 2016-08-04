import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_FONT, COLOR_GRAY, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: UNIT,
    marginTop: UNIT,
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
    width: UNIT * 8
  },
  swipeButtonIcon: {
    opacity: 0.8,
    marginTop: 4,
    width: UNIT * 3.5,
    height: UNIT * 3.5
  }
});
