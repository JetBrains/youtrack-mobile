import {StyleSheet} from 'react-native';
import {COLOR_FONT_ON_BLACK, UNIT, COLOR_FONT} from '../../components/variables/variables';


export default StyleSheet.create({
  headerTitle: {
    color: COLOR_FONT_ON_BLACK,
    fontSize: 17
  },
  wiki: {
    paddingTop: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingBottom: UNIT * 9
  },
  plainText: {
    color: COLOR_FONT
  }
});
