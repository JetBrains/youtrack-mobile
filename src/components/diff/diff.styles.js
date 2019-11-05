import {StyleSheet} from 'react-native';
import {COLOR_ICON_MEDIUM_GREY, COLOR_LINK, UNIT} from '../variables/variables';

const toggleColor = COLOR_LINK;

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
    marginBottom: UNIT,
    color: COLOR_ICON_MEDIUM_GREY
  },
  toggle: {
    color: toggleColor
  },
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    tintColor: toggleColor,
    transform: []
  },
  iconCollapse: {
    transform: [{rotate: '180deg'}]
  }
});
