import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
  header: {
    paddingBottom: 12,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: COLOR_BLACK,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    flexShrink: 0
  },
  headerButtonLeft: {
    justifyContent: 'flex-start',
    paddingLeft: UNIT
  },
  headerButtonRight: {
    justifyContent: 'flex-end',
    paddingRight: UNIT
  },
  headerButtonText: {
    flex: 0,
    fontSize: 17,
    color: COLOR_PINK
  },
  headerCenter: {
    flex: 2.5,
    alignItems: 'center',
    flexShrink: 1,
    padding: 0
  }
});
