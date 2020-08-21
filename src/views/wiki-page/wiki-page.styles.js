import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_LIGHT_GRAY} from '../../components/variables/variables';
import {headerTitle, monospace, SECONDARY_FONT_SIZE} from '../../components/common-styles/typography';


export default StyleSheet.create({
  headerTitle: {
    ...headerTitle
  },
  wiki: {
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2,
    backgroundColor: COLOR_LIGHT_GRAY,
  },
  plainText: {
    color: COLOR_BLACK,
    fontSize: SECONDARY_FONT_SIZE,
    ...monospace
  }
});
