import {StyleSheet} from 'react-native';
import {COLOR_ICON_MEDIUM_GREY, COLOR_PINK, UNIT} from '../variables/variables';

const toggleColor = COLOR_PINK;

export default StyleSheet.create({
  button: {
    flexDirection: 'row'
  },
  diffInsert: {
    backgroundColor: '#E6FFE6'
  },
  diffDelete: {
    backgroundColor: '#FFE6E6'
  },
  diffEqual: {},
  title: {
    color: COLOR_ICON_MEDIUM_GREY
  },
  toggle: {
    color: toggleColor
  },
  content: {
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    tintColor: toggleColor
  }
});
