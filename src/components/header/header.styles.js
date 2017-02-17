import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  header: {
    paddingBottom: 9,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',

    backgroundColor: COLOR_BLACK,
  },
  headerButton: {
    flexShrink: 0,
    height: UNIT * 3,
    padding: 0,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },
  headerButtonLeft: {
    paddingLeft: UNIT*2
  },
  headerButtonRight: {
    paddingRight: UNIT*2
  },
  headerButtonText: {
    fontSize: 17,
    color: COLOR_PINK
  },
  headerButtonTextRight: {
    textAlign: 'right'
  },
  headerCenter: {
    flexShrink: 1,
    padding: 0
  }
});
