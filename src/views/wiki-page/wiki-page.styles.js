import {StyleSheet} from 'react-native';
import {COLOR_FONT_ON_BLACK, UNIT} from '../../components/variables/variables';


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
  nothighText: {
    flex: 1,
    paddingTop: UNIT * 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
