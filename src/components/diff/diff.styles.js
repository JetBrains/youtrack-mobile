import {StyleSheet} from 'react-native';
import {COLOR_ICON_MEDIUM_GREY, UNIT} from '../variables/variables';

export default StyleSheet.create({
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
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    tintColor: COLOR_ICON_MEDIUM_GREY,
    transform: []
  },
  iconCollapse: {
    transform: [{rotate: '180deg'}]
  }
});
