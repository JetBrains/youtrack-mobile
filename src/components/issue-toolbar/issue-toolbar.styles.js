import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    backgroundColor: COLOR_BLACK
  },
  toolbarButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: UNIT / 2,
    paddingBottom: UNIT * 1.5
  },
  toolbarIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain'
  },
  counter: {
    position: 'absolute',
    top: 0,
    right: -14,

    fontSize: 14,
    backgroundColor: 'transparent',
    color: COLOR_FONT_GRAY
  }
});
