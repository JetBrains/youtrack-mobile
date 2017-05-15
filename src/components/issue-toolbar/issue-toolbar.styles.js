import {StyleSheet, Platform} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    zIndex: Platform.OS === 'ios' ? -1 : null,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: UNIT,
    paddingRight: UNIT,
    backgroundColor: COLOR_BLACK
  },
  toolbarButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: UNIT * 2,
  },
  toolbarIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  counter: {
    position: 'absolute',
    top: -3,
    right: -14,

    fontSize: 14,
    backgroundColor: 'transparent',
    color: COLOR_FONT_GRAY
  }
});
