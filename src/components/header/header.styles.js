import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_LIGHT_GRAY, COLOR_GRAY} from '../../components/variables/variables';
import TOP_PADDING from './header__top-padding';

export default StyleSheet.create({
  header: {
    paddingTop: TOP_PADDING,
    paddingBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',

    backgroundColor: COLOR_LIGHT_GRAY,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  headerButton: {
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
    color: COLOR_PINK,
    width: 60
  },
  headerButtonTextRight: {
    textAlign: 'right'
  },
  headerCenter: {
    padding: 0
  }
});
