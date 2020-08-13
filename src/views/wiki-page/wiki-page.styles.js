import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK} from '../../components/variables/variables';
import {headerTitle, monospace, SECONDARY_FONT_SIZE} from '../../components/common-styles/typography';


export default StyleSheet.create({
  headerTitle: {
    ...headerTitle
  },
  wiki: {
    paddingTop: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingBottom: UNIT * 9
  },
  plainText: {
    color: COLOR_BLACK,
    fontSize: SECONDARY_FONT_SIZE,
    ...monospace
  }
});
