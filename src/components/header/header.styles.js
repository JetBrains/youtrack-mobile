import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  header: {
    paddingBottom: 12,
    flex: 0,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    flexDirection: 'row',
    justifyContent: 'space-between',

    backgroundColor: COLOR_BLACK,
  },
  headerButton: {
    flexShrink: 0
  },
  headerButtonLeft: {},
  headerButtonRight: {},
  headerButtonText: {
    fontSize: 17,
    color: COLOR_PINK
  },
  headerCenter: {
    flexShrink: 1,
    padding: 0
  }
});
